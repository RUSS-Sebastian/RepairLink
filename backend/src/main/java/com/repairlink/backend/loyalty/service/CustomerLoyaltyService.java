package com.repairlink.backend.loyalty.service;

import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.loyalty.dto.CustomerLoyaltyResponse;
import com.repairlink.backend.loyalty.dto.LoyaltyPointTransactionDto;
import com.repairlink.backend.loyalty.entity.CustomerLoyaltyAccount;
import com.repairlink.backend.loyalty.entity.LoyaltyPointTransaction;
import com.repairlink.backend.loyalty.entity.LoyaltyRank;
import com.repairlink.backend.loyalty.repository.CustomerLoyaltyAccountRepository;
import com.repairlink.backend.loyalty.repository.LoyaltyPointTransactionRepository;
import com.repairlink.backend.loyalty.repository.LoyaltyRankRepository;
import com.repairlink.backend.security.auth.entity.Role;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.entity.UserRole;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.security.auth.repository.UserRoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerLoyaltyService {

    private final CustomerLoyaltyAccountRepository accountRepository;
    private final LoyaltyRankRepository rankRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final LoyaltyPointTransactionRepository transactionRepository;

    public CustomerLoyaltyService(
            CustomerLoyaltyAccountRepository accountRepository,
            LoyaltyRankRepository rankRepository,
            UserAccountRepository userAccountRepository,
            UserRoleRepository userRoleRepository,
            LoyaltyPointTransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.rankRepository = rankRepository;
        this.userAccountRepository = userAccountRepository;
        this.userRoleRepository = userRoleRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public CustomerLoyaltyResponse getCurrentCustomerLoyalty(UUID userId) {
        requireCustomer(userId);
        CustomerLoyaltyAccount account = accountRepository
                .findByUserUserId(userId)
                .orElseGet(() -> createAccount(userId));

        List<LoyaltyRank> configuredRanks = rankRepository.findAllByOrderByMinimumPointsAsc();
        List<LoyaltyRank> activeRanks = configuredRanks.stream()
                .filter(LoyaltyRank::isActive)
                .toList();

        LoyaltyProgress progress = calculateProgress(
                account.getTotalPoints(),
                activeRanks,
                configuredRanks.stream()
                        .filter(LoyaltyRank::isProtectedRank)
                        .findFirst()
                        .orElse(null)
        );

        List<LoyaltyPointTransactionDto> pointHistory = transactionRepository
                .findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(t -> new LoyaltyPointTransactionDto(
                        t.getTransactionId(),
                        t.getPointsDelta(),
                        t.getTransactionType(),
                        t.getDescription(),
                        t.getReferenceId(),
                        t.getCreatedAt()
                ))
                .toList();

        return new CustomerLoyaltyResponse(
                account.getTotalPoints(),
                account.getLifetimePoints(),
                account.getServicesCompleted(),
                progress.rankName(),
                progress.discountPercentage(),
                progress.rankMinimumPoints(),
                progress.rankMaximumPoints(),
                progress.nextRankName(),
                progress.pointsToNextRank(),
                pointHistory
        );
    }

    @Transactional
    public void deductPointsForAppointmentCancellation(
            UUID userId,
            long pointsToDeduct,
            String appointmentCode,
            UUID appointmentId
    ) {
        CustomerLoyaltyAccount account = accountRepository
                .findByUserUserId(userId)
                .orElseGet(() -> createAccount(userId));

        long currentPoints = account.getTotalPoints();
        long actualDeducted = Math.min(currentPoints, pointsToDeduct);
        account.setTotalPoints(currentPoints - actualDeducted);
        accountRepository.save(account);

        LoyaltyPointTransaction transaction = new LoyaltyPointTransaction();
        transaction.setUser(account.getUser());
        transaction.setPointsDelta(-actualDeducted);
        transaction.setTransactionType("PENALTY");
        if (actualDeducted == pointsToDeduct) {
            transaction.setDescription("Penalty for cancelling appointment " + appointmentCode);
        } else if (actualDeducted > 0) {
            transaction.setDescription("Penalty for cancelling appointment " + appointmentCode + " (" + actualDeducted + " pts deducted; balance reached 0)");
        } else {
            transaction.setDescription("Penalty policy applied for cancelling appointment " + appointmentCode + " (0 pts deducted; zero balance)");
        }
        transaction.setReferenceId(appointmentId);
        transactionRepository.save(transaction);
    }

    @Transactional
    public CustomerLoyaltyResponse resetLoyaltyData(UUID userId) {
        requireCustomer(userId);

        CustomerLoyaltyAccount account = accountRepository
                .findByUserUserId(userId)
                .orElseGet(() -> createAccount(userId));

        account.setTotalPoints(0);
        account.setLifetimePoints(0);
        account.setServicesCompleted(0);
        accountRepository.save(account);

        transactionRepository.deleteByUser_UserId(userId);

        return getCurrentCustomerLoyalty(userId);
    }

    private CustomerLoyaltyAccount createAccount(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        CustomerLoyaltyAccount account = new CustomerLoyaltyAccount();
        account.setUser(user);
        return accountRepository.save(account);
    }

    private void requireCustomer(UUID userId) {
        boolean isCustomer = userRoleRepository
                .findAllByUserUserIdAndActiveTrue(userId)
                .stream()
                .map(UserRole::getRole)
                .map(Role::getRoleCode)
                .anyMatch(RoleCode.CUSTOMER::equals);

        if (!isCustomer) {
            throw new IllegalStateException("Only customers can access loyalty details.");
        }
    }

        private LoyaltyProgress calculateProgress(
                        long points,
                        List<LoyaltyRank> activeRanks,
                        LoyaltyRank protectedRank
        ) {
        if (activeRanks.isEmpty()) {
                        if (protectedRank != null) {
                                return new LoyaltyProgress(
                                                protectedRank.getRankName(),
                                                protectedRank.getDiscountPercentage(),
                                                protectedRank.getMinimumPoints(),
                                                protectedRank.getMaximumPoints(),
                                                null,
                                                0
                                );
                        }

                        return new LoyaltyProgress("Bronze", BigDecimal.ZERO, 0, 999, "Silver", 1000);
        }

                if (points < activeRanks.get(0).getMinimumPoints() && protectedRank != null) {
                        return new LoyaltyProgress(
                                        protectedRank.getRankName(),
                                        protectedRank.getDiscountPercentage(),
                                        protectedRank.getMinimumPoints(),
                                        protectedRank.getMaximumPoints(),
                                        activeRanks.get(0).getRankName(),
                                        Math.max(0, activeRanks.get(0).getMinimumPoints() - points)
                        );
                }

        for (int index = 0; index < activeRanks.size(); index++) {
            LoyaltyRank rank = activeRanks.get(index);
            long effectiveMaximum = index + 1 < activeRanks.size()
                    ? activeRanks.get(index + 1).getMinimumPoints() - 1
                    : rank.getMaximumPoints();

            if (points >= rank.getMinimumPoints() && points <= effectiveMaximum) {
                String nextRankName = index + 1 < activeRanks.size()
                        ? activeRanks.get(index + 1).getRankName()
                        : null;
                long pointsToNextRank = nextRankName == null
                        ? 0
                        : Math.max(0, activeRanks.get(index + 1).getMinimumPoints() - points);
                return new LoyaltyProgress(
                        rank.getRankName(),
                        rank.getDiscountPercentage(),
                        rank.getMinimumPoints(),
                        effectiveMaximum,
                        nextRankName,
                        pointsToNextRank
                );
            }
        }

        LoyaltyRank highest = activeRanks.get(activeRanks.size() - 1);
        return new LoyaltyProgress(
                highest.getRankName(),
                highest.getDiscountPercentage(),
                highest.getMinimumPoints(),
                highest.getMaximumPoints(),
                null,
                0
        );
    }

    private record LoyaltyProgress(
            String rankName,
            BigDecimal discountPercentage,
            long rankMinimumPoints,
            long rankMaximumPoints,
            String nextRankName,
            long pointsToNextRank
    ) {
    }
}
