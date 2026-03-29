package vaultcore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransferResponse {
    private String txRef;
    private String status;
    private BigDecimal amount;
    private String fromAccount;
    private String toAccount;
    private String message;
    private boolean fraudFlagged;
}