package com.repairlink.backend.loyalty.repository;

import com.repairlink.backend.loyalty.entity.LoyaltyPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransaction, UUID> {

    List<LoyaltyPointTransaction> findByUser_UserIdOrderByCreatedAtDesc(UUID userId);

    void deleteByUser_UserId(UUID userId);
}
