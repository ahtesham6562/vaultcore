package vaultcore_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vaultcore_backend.dto.TransferRequest;
import vaultcore_backend.dto.TransferResponse;
import vaultcore_backend.service.TransferService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/send")
    public ResponseEntity<TransferResponse> transfer(
            Authentication authentication,
            @Valid @RequestBody TransferRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(transferService.transfer(username, request));
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(
            Authentication authentication) {
        String username = authentication.getName();
        BigDecimal balance = transferService.getBalance(username);
        return ResponseEntity.ok(Map.of(
                "username", username,
                "balance", balance,
                "currency", "INR"
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transferService.getHistory(username));
    }
}