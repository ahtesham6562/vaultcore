package vaultcore_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tx_ref", unique = true, nullable = false, length = 30)
    private String txRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    private Account toAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    @Column(name = "fraud_flagged", nullable = false)
    private boolean fraudFlagged;

    @Column(name = "otp_verified", nullable = false)
    private boolean otpVerified;

    @Column(length = 255)
    private String description;

    @Column(name = "initiated_at", nullable = false, updatable = false)
    private ZonedDateTime initiatedAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    @PrePersist
    public void prePersist() {
        this.initiatedAt = ZonedDateTime.now();
        if (this.status == null) this.status = TransactionStatus.PENDING;
        this.fraudFlagged = false;
        this.otpVerified = false;
    }

    public enum TransactionStatus {
        PENDING, COMMITTED, FAILED, PENDING_2FA
    }
}