package vaultcore_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vaultcore_backend.model.StockHolding;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockHoldingRepository extends JpaRepository<StockHolding, UUID> {
    List<StockHolding> findByAccountId(UUID accountId);
    Optional<StockHolding> findByAccountIdAndSymbol(UUID accountId, String symbol);
}