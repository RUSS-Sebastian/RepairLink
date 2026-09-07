package com.repairlink.backend.loyalty.repository;

import com.repairlink.backend.loyalty.entity.LoyaltyRank;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LoyaltyRankRepository extends JpaRepository<LoyaltyRank, UUID> {

    List<LoyaltyRank> findAllByOrderByMinimumPointsAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM LoyaltyRank r ORDER BY r.minimumPoints ASC")
    List<LoyaltyRank> findAllForUpdate();

    boolean existsByRankNameIgnoreCase(String rankName);

    boolean existsByRankNameIgnoreCaseAndLoyaltyRankIdNot(String rankName, UUID id);
}
