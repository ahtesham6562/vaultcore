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
import java.util.List;
import java.util.Map;
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

        Account sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        if (sender == null) throw new RuntimeException("Sender account not found");

        Account receiver = accountRepository.findByAccountNo(request.getToAccountNo())
                .orElseThrow(() -> new RuntimeException("Receiver account not found: " + request.getToAccountNo()));

        if (sender.getId().equals(receiver.getId()))
            throw new RuntimeException("Cannot transfer to same account");

        if (sender.getBalance().compareTo(request.getAmount()) < 0)
            throw new RuntimeException("Insufficient balance");

        boolean isFraud = request.getAmount().compareTo(fraudThreshold) > 0;

        String txRef = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Transaction transaction = Transaction.builder()
                .txRef(txRef)
                .fromAccount(sender)
                .toAccount(receiver)
                .amount(request.getAmount())
                .status(isFraud ? Transaction.TransactionStatus.PENDING_2FA : Transaction.TransactionStatus.PENDING)
                .fraudFlagged(isFraud)
                .description(request.getDescription())
                .build();
        transactionRepository.save(transaction);

        if (isFraud) {
            log.warn("Fraud detected! TxRef: {}, Amount: {}", txRef, request.getAmount());
            return TransferResponse.builder()
                    .txRef(txRef).status("PENDING_2FA").amount(request.getAmount())
                    .fromAccount(sender.getAccountNo()).toAccount(receiver.getAccountNo())
                    .fraudFlagged(true).message("Transaction flagged! 2FA required.")
                    .build();
        }

        BigDecimal senderNewBalance = sender.getBalance().subtract(request.getAmount());
        sender.setBalance(senderNewBalance);
        accountRepository.save(sender);

        BigDecimal receiverNewBalance = receiver.getBalance().add(request.getAmount());
        receiver.setBalance(receiverNewBalance);
        accountRepository.save(receiver);

        ledgerEntryRepository.save(LedgerEntry.builder()
                .txRef(txRef).account(sender)
                .entryType(LedgerEntry.EntryType.DEBIT)
                .amount(request.getAmount()).balanceAfter(senderNewBalance)
                .description("Transfer to " + receiver.getAccountNo())
                .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .txRef(txRef).account(receiver)
                .entryType(LedgerEntry.EntryType.CREDIT)
                .amount(request.getAmount()).balanceAfter(receiverNewBalance)
                .description("Transfer from " + sender.getAccountNo())
                .build());

        transaction.setStatus(Transaction.TransactionStatus.COMMITTED);
        transaction.setCompletedAt(ZonedDateTime.now());
        transactionRepository.save(transaction);

        log.info("Transfer successful! TxRef: {}, Amount: {}", txRef, request.getAmount());

        return TransferResponse.builder()
                .txRef(txRef).status("COMMITTED").amount(request.getAmount())
                .fromAccount(sender.getAccountNo()).toAccount(receiver.getAccountNo())
                .fraudFlagged(false).message("Transfer successful!")
                .build();
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(String username) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();
        return account != null ? account.getBalance() : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHistory(String username) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        return ledgerEntryRepository
                .findByAccountIdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(e -> Map.<String, Object>of(
                        "txRef", e.getTxRef(),
                        "type", e.getEntryType().toString(),
                        "amount", e.getAmount(),
                        "balanceAfter", e.getBalanceAfter(),
                        "description", e.getDescription() != null ? e.getDescription() : "-",
                        "date", e.getCreatedAt().toString()
                )).toList();
    }
}