package com.repairlink.backend.loyalty.entity;

import com.repairlink.backend.security.auth.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "loyalty_ranks")
public class LoyaltyRank {

    @Id
    @UuidGenerator
    @Column(name = "loyalty_rank_id", nullable = false, updatable = false)
    private UUID loyaltyRankId;

    @Column(name = "rank_name", nullable = false, length = 60)
    private String rankName;

    @Column(name = "minimum_points", nullable = false)
    private Long minimumPoints;

    @Column(name = "maximum_points", nullable = false)
    private Long maximumPoints;

    @Column(name = "discount_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "is_protected", nullable = false)
    private boolean protectedRank;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

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

    public UUID getLoyaltyRankId() { return loyaltyRankId; }
    public String getRankName() { return rankName; }
    public void setRankName(String rankName) { this.rankName = rankName; }
    public Long getMinimumPoints() { return minimumPoints; }
    public void setMinimumPoints(Long minimumPoints) { this.minimumPoints = minimumPoints; }
    public Long getMaximumPoints() { return maximumPoints; }
    public void setMaximumPoints(Long maximumPoints) { this.maximumPoints = maximumPoints; }
    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isProtectedRank() { return protectedRank; }
    public void setProtectedRank(boolean protectedRank) { this.protectedRank = protectedRank; }
    public void setCreatedBy(UserAccount createdBy) { this.createdBy = createdBy; }
    public void setUpdatedBy(UserAccount updatedBy) { this.updatedBy = updatedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
