package vaultcore_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vaultcore_backend.model.Account;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByAccountNo(String accountNo);
    Optional<Account> findByEmail(String email);
    boolean existsByAccountNo(String accountNo);
}