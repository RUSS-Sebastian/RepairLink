package com.repairlink.backend.loyalty.service;

import com.repairlink.backend.common.exception.LoyaltyRankNameAlreadyExistsException;
import com.repairlink.backend.common.exception.LoyaltyRankNotFoundException;
import com.repairlink.backend.loyalty.dto.CreateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.dto.LoyaltyRankListResponse;
import com.repairlink.backend.loyalty.dto.LoyaltyRankResponse;
import com.repairlink.backend.loyalty.dto.UpdateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.entity.LoyaltyRank;
import com.repairlink.backend.loyalty.repository.LoyaltyRankRepository;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class LoyaltyRankService {

    private final LoyaltyRankRepository repository;
    private final UserAccountRepository userAccountRepository;

    public LoyaltyRankService(
            LoyaltyRankRepository repository,
            UserAccountRepository userAccountRepository
    ) {
        this.repository = repository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public LoyaltyRankListResponse list() {
        List<LoyaltyRank> ranks = repository.findAllByOrderByMinimumPointsAsc();
        List<LoyaltyRankResponse> items = toResponses(ranks);
        long active = ranks.stream().filter(LoyaltyRank::isActive).count();
        return new LoyaltyRankListResponse(items, ranks.size(), active, ranks.size() - active);
    }

    @Transactional
    public LoyaltyRankResponse create(UUID adminId, CreateLoyaltyRankRequest request) {
        List<LoyaltyRank> ranks = repository.findAllForUpdate();
        String name = normalizeName(request.rankName());
        assertNameAvailable(name, null);
        validateRange(request.minimumPoints(), request.maximumPoints());
        UserAccount admin = findUser(adminId);

        LoyaltyRank rank = new LoyaltyRank();
        rank.setRankName(name);
        rank.setMinimumPoints(request.minimumPoints());
        rank.setMaximumPoints(request.maximumPoints());
        rank.setDiscountPercentage(request.discountPercentage());
        rank.setActive(true);
        rank.setProtectedRank(ranks.isEmpty());
        rank.setCreatedBy(admin);
        rank.setUpdatedBy(admin);

        if (ranks.isEmpty()) {
            if (request.minimumPoints() != 0) {
                throw new IllegalArgumentException("The first loyalty rank must start at 0 points.");
            }
        } else {
            LoyaltyRank highest = ranks.get(ranks.size() - 1);
            long expectedMinimum = safeIncrement(highest.getMaximumPoints());
            if (request.minimumPoints() != expectedMinimum) {
                throw new IllegalArgumentException(
                        "A new loyalty rank must start at " + expectedMinimum + " points."
                );
            }
            if (request.discountPercentage().compareTo(highest.getDiscountPercentage()) < 0) {
                throw new IllegalArgumentException(
                        "A higher loyalty rank cannot have a lower discount percentage."
                );
            }
        }

        LoyaltyRank saved = save(rank);
        ranks.add(saved);
        return responseFor(saved, sorted(ranks));
    }

    @Transactional
    public LoyaltyRankResponse update(
            UUID adminId,
            UUID rankId,
            UpdateLoyaltyRankRequest request
    ) {
        List<LoyaltyRank> ranks = repository.findAllForUpdate();
        int index = indexOf(ranks, rankId);
        LoyaltyRank rank = ranks.get(index);
        String name = normalizeName(request.rankName());
        assertNameAvailable(name, rankId);
        validateRange(request.minimumPoints(), request.maximumPoints());

        if (rank.isProtectedRank() && request.minimumPoints() != 0) {
            throw new IllegalArgumentException("The protected first rank must start at 0 points.");
        }

        UserAccount admin = findUser(adminId);
        if (index > 0) {
            LoyaltyRank previous = ranks.get(index - 1);
            long adjustedPreviousMaximum = request.minimumPoints() - 1;
            if (adjustedPreviousMaximum < previous.getMinimumPoints()) {
                throw new IllegalArgumentException("The minimum points would make the previous rank invalid.");
            }
            previous.setMaximumPoints(adjustedPreviousMaximum);
            previous.setUpdatedBy(admin);
        }

        if (index < ranks.size() - 1) {
            LoyaltyRank next = ranks.get(index + 1);
            long adjustedNextMinimum = safeIncrement(request.maximumPoints());
            if (adjustedNextMinimum > next.getMaximumPoints()) {
                throw new IllegalArgumentException("The maximum points would make the next rank invalid.");
            }
            next.setMinimumPoints(adjustedNextMinimum);
            next.setUpdatedBy(admin);
        }

        rank.setRankName(name);
        rank.setMinimumPoints(request.minimumPoints());
        rank.setMaximumPoints(request.maximumPoints());
        rank.setDiscountPercentage(request.discountPercentage());
        rank.setUpdatedBy(admin);

        validateConfiguredSequence(ranks);
        validateDiscountSequence(ranks);
        try {
            repository.saveAllAndFlush(ranks);
        } catch (DataIntegrityViolationException exception) {
            throw new LoyaltyRankNameAlreadyExistsException();
        }
        return responseFor(rank, sorted(ranks));
    }

    @Transactional
    public LoyaltyRankResponse changeActive(UUID adminId, UUID rankId, boolean active) {
        List<LoyaltyRank> ranks = repository.findAllForUpdate();
        LoyaltyRank rank = ranks.get(indexOf(ranks, rankId));
        if (!active && rank.isProtectedRank()) {
            throw new IllegalArgumentException("The protected first loyalty rank cannot be deactivated.");
        }
        rank.setActive(active);
        rank.setUpdatedBy(findUser(adminId));
        repository.saveAndFlush(rank);
        return responseFor(rank, sorted(ranks));
    }

    private void validateConfiguredSequence(List<LoyaltyRank> ranks) {
        List<LoyaltyRank> ordered = sorted(ranks);
        if (!ordered.isEmpty() && ordered.get(0).getMinimumPoints() != 0) {
            throw new IllegalArgumentException("The first loyalty rank must start at 0 points.");
        }
        for (int index = 0; index < ordered.size(); index++) {
            LoyaltyRank current = ordered.get(index);
            validateRange(current.getMinimumPoints(), current.getMaximumPoints());
            if (index > 0) {
                LoyaltyRank previous = ordered.get(index - 1);
                if (current.getMinimumPoints() != safeIncrement(previous.getMaximumPoints())) {
                    throw new IllegalArgumentException("Loyalty point ranges must be continuous and cannot overlap.");
                }
            }
        }
    }

    private void validateDiscountSequence(List<LoyaltyRank> ranks) {
        List<LoyaltyRank> ordered = sorted(ranks);
        for (int index = 1; index < ordered.size(); index++) {
            BigDecimal previous = ordered.get(index - 1).getDiscountPercentage();
            BigDecimal current = ordered.get(index).getDiscountPercentage();
            if (current.compareTo(previous) < 0) {
                throw new IllegalArgumentException(
                        "A higher loyalty rank cannot have a lower discount percentage."
                );
            }
        }
    }

    private void validateRange(long minimum, long maximum) {
        if (minimum < 0 || maximum < 0) {
            throw new IllegalArgumentException("Loyalty points cannot be negative.");
        }
        if (maximum < minimum) {
            throw new IllegalArgumentException("Maximum points must be greater than or equal to minimum points.");
        }
    }

    private long safeIncrement(long value) {
        if (value == Long.MAX_VALUE) {
            throw new IllegalArgumentException("The highest loyalty point value cannot be increased.");
        }
        return value + 1;
    }

    private int indexOf(List<LoyaltyRank> ranks, UUID rankId) {
        for (int index = 0; index < ranks.size(); index++) {
            if (ranks.get(index).getLoyaltyRankId().equals(rankId)) {
                return index;
            }
        }
        throw new LoyaltyRankNotFoundException();
    }

    private void assertNameAvailable(String name, UUID rankId) {
        boolean exists = rankId == null
                ? repository.existsByRankNameIgnoreCase(name)
                : repository.existsByRankNameIgnoreCaseAndLoyaltyRankIdNot(name, rankId);
        if (exists) {
            throw new LoyaltyRankNameAlreadyExistsException();
        }
    }

    private String normalizeName(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Rank name is required.");
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private UserAccount findUser(UUID userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
    }

    private LoyaltyRank save(LoyaltyRank rank) {
        try {
            return repository.saveAndFlush(rank);
        } catch (DataIntegrityViolationException exception) {
            throw new LoyaltyRankNameAlreadyExistsException();
        }
    }

    private List<LoyaltyRank> sorted(List<LoyaltyRank> ranks) {
        List<LoyaltyRank> ordered = new ArrayList<>(ranks);
        ordered.sort(Comparator.comparingLong(LoyaltyRank::getMinimumPoints));
        return ordered;
    }

    private List<LoyaltyRankResponse> toResponses(List<LoyaltyRank> ranks) {
        List<LoyaltyRank> ordered = sorted(ranks);
        return ordered.stream().map(rank -> responseFor(rank, ordered)).toList();
    }

    private LoyaltyRankResponse responseFor(LoyaltyRank rank, List<LoyaltyRank> ordered) {
        int activeOrder = 0;
        Integer rankOrder = null;
        long effectiveMaximum = rank.getMaximumPoints();
        long globalMaximum = ordered.isEmpty()
                ? rank.getMaximumPoints()
                : ordered.get(ordered.size() - 1).getMaximumPoints();

        if (rank.isActive()) {
            for (LoyaltyRank candidate : ordered) {
                if (!candidate.isActive()) {
                    continue;
                }
                activeOrder++;
                if (candidate == rank) {
                    rankOrder = activeOrder;
                    effectiveMaximum = globalMaximum;
                    for (LoyaltyRank later : ordered) {
                        if (later.getMinimumPoints() > rank.getMinimumPoints() && later.isActive()) {
                            effectiveMaximum = later.getMinimumPoints() - 1;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        return new LoyaltyRankResponse(
                rank.getLoyaltyRankId(),
                rank.getRankName(),
                rank.getMinimumPoints(),
                effectiveMaximum,
                rank.getMinimumPoints(),
                rank.getMaximumPoints(),
                rank.getDiscountPercentage(),
                rankOrder,
                rank.isActive(),
                rank.isProtectedRank(),
                rank.getCreatedAt(),
                rank.getUpdatedAt()
        );
    }
}
