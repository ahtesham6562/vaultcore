package vaultcore_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vaultcore_backend.model.Transaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Optional<Transaction> findByTxRef(String txRef);
    List<Transaction> findByFromAccountIdOrderByInitiatedAtDesc(UUID accountId);
    List<Transaction> findByToAccountIdOrderByInitiatedAtDesc(UUID accountId);
}