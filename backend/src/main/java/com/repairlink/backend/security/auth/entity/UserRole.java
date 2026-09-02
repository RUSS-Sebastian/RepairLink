package com.repairlink.backend.security.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_roles")
public class UserRole {

    @Id
    @UuidGenerator
    @Column(name = "user_role_id", nullable = false, updatable = false)
    private UUID userRoleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "active_from", nullable = false)
    private Instant activeFrom;

    @Column(name = "active_to")
    private Instant activeTo;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public UserRole() {
    }

    @PrePersist
    public void beforeInsert() {
        if (activeFrom == null) {
            activeFrom = Instant.now();
        }

        active = true;
    }

    public UUID getUserRoleId() {
        return userRoleId;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Instant getActiveFrom() {
        return activeFrom;
    }

    public Instant getActiveTo() {
        return activeTo;
    }

    public void setActiveTo(Instant activeTo) {
        this.activeTo = activeTo;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}