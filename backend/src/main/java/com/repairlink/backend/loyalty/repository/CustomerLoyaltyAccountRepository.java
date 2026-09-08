package com.repairlink.backend.loyalty.repository;

import com.repairlink.backend.loyalty.entity.CustomerLoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerLoyaltyAccountRepository
        extends JpaRepository<CustomerLoyaltyAccount, UUID> {

    Optional<CustomerLoyaltyAccount> findByUserUserId(UUID userId);
}
