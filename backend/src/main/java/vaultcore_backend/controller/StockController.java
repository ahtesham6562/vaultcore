package vaultcore_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vaultcore_backend.service.StockService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockController {

    private final StockService stockService;

    @GetMapping("/prices")
    public ResponseEntity<List<Map<String, Object>>> getAllPrices() {
        long start = System.currentTimeMillis();
        List<Map<String, Object>> prices = stockService.getAllStockPrices();
        long latency = System.currentTimeMillis() - start;
        System.out.println("Total latency: " + latency + "ms");
        return ResponseEntity.ok(prices);
    }

    @GetMapping("/price/{symbol}")
    public ResponseEntity<Map<String, Object>> getPrice(
            @PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getStockPrice(symbol));
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buyStock(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        String username = authentication.getName();
        String symbol = (String) request.get("symbol");
        Integer quantity = (Integer) request.get("quantity");
        return ResponseEntity.ok(stockService.buyStock(username, symbol, quantity));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<List<Map<String, Object>>> getPortfolio(
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(stockService.getPortfolio(username));
    }
}