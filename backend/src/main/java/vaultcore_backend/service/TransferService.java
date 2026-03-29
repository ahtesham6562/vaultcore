package vaultcore_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import vaultcore_backend.dto.TransferRequest;
import vaultcore_backend.dto.TransferResponse;
import vaultcore_backend.model.Account;
import vaultcore_backend.model.LedgerEntry;
import vaultcore_backend.model.Transaction;
import vaultcore_backend.repository.AccountRepository;
import vaultcore_backend.repository.LedgerEntryRepository;
import vaultcore_backend.repository.TransactionRepository;
import vaultcore_backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final UserRepository userRepository;

    @Value("${fraud.threshold:50000}")
    private BigDecimal fraudThreshold;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransferResponse transfer(String username, TransferRequest request) {

        // Sender ka account dhundo
        Account sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        if (sender == null) {
            throw new RuntimeException("Sender account not found");
        }

        // Receiver ka account dhundo
        Account receiver = accountRepository.findByAccountNo(request.getToAccountNo())
                .orElseThrow(() -> new RuntimeException("Receiver account not found: "
                        + request.getToAccountNo()));

        // Same account check
        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot transfer to same account");
        }

        // Balance check
        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Fraud check
        boolean isFraud = request.getAmount().compareTo(fraudThreshold) > 0;

        // Unique tx ref generate karo
        String txRef = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        // Transaction record banao
        Transaction transaction = Transaction.builder()
                .txRef(txRef)
                .fromAccount(sender)
                .toAccount(receiver)
                .amount(request.getAmount())
                .status(isFraud ? Transaction.TransactionStatus.PENDING_2FA
                        : Transaction.TransactionStatus.PENDING)
                .fraudFlagged(isFraud)
                .description(request.getDescription())
                .build();
        transactionRepository.save(transaction);

        // Agar fraud flagged hai toh rok do
        if (isFraud) {
            log.warn("Fraud detected! TxRef: {}, Amount: {}", txRef, request.getAmount());
            return TransferResponse.builder()
                    .txRef(txRef)
                    .status("PENDING_2FA")
                    .amount(request.getAmount())
                    .fromAccount(sender.getAccountNo())
                    .toAccount(receiver.getAccountNo())
                    .fraudFlagged(true)
                    .message("Transaction flagged! 2FA required.")
                    .build();
        }

        // Sender balance deduct karo
        BigDecimal senderNewBalance = sender.getBalance().subtract(request.getAmount());
        sender.setBalance(senderNewBalance);
        accountRepository.save(sender);

        // Receiver balance add karo
        BigDecimal receiverNewBalance = receiver.getBalance().add(request.getAmount());
        receiver.setBalance(receiverNewBalance);
        accountRepository.save(receiver);

        // Double entry ledger — DEBIT sender
        LedgerEntry debit = LedgerEntry.builder()
                .txRef(txRef)
                .account(sender)
                .entryType(LedgerEntry.EntryType.DEBIT)
                .amount(request.getAmount())
                .balanceAfter(senderNewBalance)
                .description("Transfer to " + receiver.getAccountNo())
                .build();
        ledgerEntryRepository.save(debit);

        // Double entry ledger — CREDIT receiver
        LedgerEntry credit = LedgerEntry.builder()
                .txRef(txRef)
                .account(receiver)
                .entryType(LedgerEntry.EntryType.CREDIT)
                .amount(request.getAmount())
                .balanceAfter(receiverNewBalance)
                .description("Transfer from " + sender.getAccountNo())
                .build();
        ledgerEntryRepository.save(credit);

        // Transaction status update karo
        transaction.setStatus(Transaction.TransactionStatus.COMMITTED);
        transaction.setCompletedAt(ZonedDateTime.now());
        transactionRepository.save(transaction);

        log.info("Transfer successful! TxRef: {}, Amount: {}", txRef, request.getAmount());

        return TransferResponse.builder()
                .txRef(txRef)
                .status("COMMITTED")
                .amount(request.getAmount())
                .fromAccount(sender.getAccountNo())
                .toAccount(receiver.getAccountNo())
                .fraudFlagged(false)
                .message("Transfer successful!")
                .build();
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(String username) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();
        return account != null ? account.getBalance() : BigDecimal.ZERO;
    }
}