package vaultcore_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vaultcore_backend.model.Account;
import vaultcore_backend.model.StockHolding;
import vaultcore_backend.repository.AccountRepository;
import vaultcore_backend.repository.StockHoldingRepository;
import vaultcore_backend.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockHoldingRepository stockHoldingRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private static final Map<String, BigDecimal> BASE_PRICES = new HashMap<>();

    static {
        BASE_PRICES.put("RELIANCE", new BigDecimal("2450.75"));
        BASE_PRICES.put("TCS", new BigDecimal("3890.50"));
        BASE_PRICES.put("INFY", new BigDecimal("1456.25"));
        BASE_PRICES.put("HDFC", new BigDecimal("1678.90"));
        BASE_PRICES.put("WIPRO", new BigDecimal("456.30"));
        BASE_PRICES.put("SBIN", new BigDecimal("623.45"));
        BASE_PRICES.put("TATAMOTORS", new BigDecimal("890.60"));
        BASE_PRICES.put("ITC", new BigDecimal("435.20"));
    }

    public Map<String, Object> getStockPrice(String symbol) {
        long start = System.currentTimeMillis();
        String sym = symbol.toUpperCase();
        BigDecimal basePrice = BASE_PRICES.getOrDefault(sym, new BigDecimal("100.00"));
        double fluctuation = 1 + (Math.random() * 0.04 - 0.02);
        BigDecimal currentPrice = basePrice.multiply(
                new BigDecimal(fluctuation)).setScale(2, RoundingMode.HALF_UP);
        long latency = System.currentTimeMillis() - start;
        log.info("Stock price fetched for {} in {}ms", sym, latency);
        return Map.of(
                "symbol", sym,
                "price", currentPrice,
                "currency", "INR",
                "latencyMs", latency,
                "timestamp", System.currentTimeMillis()
        );
    }

    public List<Map<String, Object>> getAllStockPrices() {
        List<Map<String, Object>> prices = new ArrayList<>();
        for (String symbol : BASE_PRICES.keySet()) {
            prices.add(getStockPrice(symbol));
        }
        return prices;
    }

    @Transactional
    public Map<String, Object> buyStock(String username, String symbol, Integer quantity) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        String sym = symbol.toUpperCase();
        Map<String, Object> priceData = getStockPrice(sym);
        BigDecimal price = (BigDecimal) priceData.get("price");
        BigDecimal totalCost = price.multiply(new BigDecimal(quantity));

        if (account.getBalance().compareTo(totalCost) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(totalCost));
        accountRepository.save(account);

        Optional<StockHolding> existing =
                stockHoldingRepository.findByAccountIdAndSymbol(account.getId(), sym);

        if (existing.isPresent()) {
            StockHolding holding = existing.get();
            int newQty = holding.getQuantity() + quantity;
            BigDecimal newAvgCost = (holding.getAvgCost()
                    .multiply(new BigDecimal(holding.getQuantity()))
                    .add(totalCost))
                    .divide(new BigDecimal(newQty), 2, RoundingMode.HALF_UP);
            holding.setQuantity(newQty);
            holding.setAvgCost(newAvgCost);
            stockHoldingRepository.save(holding);
        } else {
            StockHolding holding = StockHolding.builder()
                    .account(account)
                    .symbol(sym)
                    .quantity(quantity)
                    .avgCost(price)
                    .build();
            stockHoldingRepository.save(holding);
        }

        return Map.of(
                "message", "Stock purchased successfully!",
                "symbol", sym,
                "quantity", quantity,
                "price", price,
                "totalCost", totalCost,
                "remainingBalance", account.getBalance()
        );
    }

    @Transactional
    public Map<String, Object> sellStock(String username, String symbol, Integer quantity) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        String sym = symbol.toUpperCase();

        StockHolding holding = stockHoldingRepository
                .findByAccountIdAndSymbol(account.getId(), sym)
                .orElseThrow(() -> new RuntimeException("You don't own " + sym));

        if (holding.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient shares. You have: " + holding.getQuantity());
        }

        Map<String, Object> priceData = getStockPrice(sym);
        BigDecimal price = (BigDecimal) priceData.get("price");
        BigDecimal totalEarned = price.multiply(new BigDecimal(quantity));

        account.setBalance(account.getBalance().add(totalEarned));
        accountRepository.save(account);

        int newQty = holding.getQuantity() - quantity;
        if (newQty == 0) {
            stockHoldingRepository.delete(holding);
        } else {
            holding.setQuantity(newQty);
            stockHoldingRepository.save(holding);
        }

        return Map.of(
                "message", "Stock sold successfully!",
                "symbol", sym,
                "quantity", quantity,
                "price", price,
                "totalEarned", totalEarned,
                "remainingBalance", account.getBalance()
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPortfolio(String username) {
        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        List<StockHolding> holdings =
                stockHoldingRepository.findByAccountId(account.getId());

        List<Map<String, Object>> portfolio = new ArrayList<>();
        for (StockHolding holding : holdings) {
            Map<String, Object> priceData = getStockPrice(holding.getSymbol());
            BigDecimal currentPrice = (BigDecimal) priceData.get("price");
            BigDecimal currentValue = currentPrice.multiply(
                    new BigDecimal(holding.getQuantity()));
            BigDecimal invested = holding.getAvgCost().multiply(
                    new BigDecimal(holding.getQuantity()));
            BigDecimal pnl = currentValue.subtract(invested);

            portfolio.add(Map.of(
                    "symbol", holding.getSymbol(),
                    "quantity", holding.getQuantity(),
                    "avgCost", holding.getAvgCost(),
                    "currentPrice", currentPrice,
                    "currentValue", currentValue,
                    "invested", invested,
                    "pnl", pnl
            ));
        }
        return portfolio;
    }
}