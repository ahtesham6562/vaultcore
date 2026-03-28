package vaultcore_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "account_no", unique = true, nullable = false, length = 20)
    private String accountNo;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
        if (this.balance == null) this.balance = BigDecimal.ZERO;
        if (this.status == null) this.status = AccountStatus.ACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }

    public enum AccountStatus {
        ACTIVE, SUSPENDED, CLOSED
    }
}