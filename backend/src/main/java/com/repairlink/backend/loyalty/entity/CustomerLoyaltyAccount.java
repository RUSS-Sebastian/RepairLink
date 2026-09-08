package com.repairlink.backend.loyalty.entity;

import com.repairlink.backend.security.auth.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customer_loyalty_accounts")
public class CustomerLoyaltyAccount {

    @Id
    @UuidGenerator
    @Column(name = "loyalty_account_id", nullable = false, updatable = false)
    private UUID loyaltyAccountId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserAccount user;

    @Column(name = "total_points", nullable = false)
    private long totalPoints;

    @Column(name = "lifetime_points", nullable = false)
    private long lifetimePoints;

    @Column(name = "services_completed", nullable = false)
    private long servicesCompleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void beforeInsert() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getLoyaltyAccountId() { return loyaltyAccountId; }
    public UserAccount getUser() { return user; }
    public void setUser(UserAccount user) { this.user = user; }
    public long getTotalPoints() { return totalPoints; }
    public void setTotalPoints(long totalPoints) { this.totalPoints = totalPoints; }
    public long getLifetimePoints() { return lifetimePoints; }
    public void setLifetimePoints(long lifetimePoints) { this.lifetimePoints = lifetimePoints; }
    public long getServicesCompleted() { return servicesCompleted; }
    public void setServicesCompleted(long servicesCompleted) { this.servicesCompleted = servicesCompleted; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
