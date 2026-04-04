package vaultcore_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vaultcore_backend.model.LedgerEntry;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findByAccountIdOrderByCreatedAtDesc(UUID accountId);
    List<LedgerEntry> findByTxRef(String txRef);
    List<LedgerEntry> findByAccount_EmailOrderByCreatedAtDesc(String email);
}