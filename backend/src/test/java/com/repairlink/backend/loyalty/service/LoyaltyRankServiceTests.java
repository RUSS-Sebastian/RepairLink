package com.repairlink.backend.loyalty.service;

import com.repairlink.backend.loyalty.dto.CreateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.dto.LoyaltyRankListResponse;
import com.repairlink.backend.loyalty.dto.LoyaltyRankResponse;
import com.repairlink.backend.loyalty.dto.UpdateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.entity.LoyaltyRank;
import com.repairlink.backend.loyalty.repository.LoyaltyRankRepository;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoyaltyRankServiceTests {

    @Mock
    private LoyaltyRankRepository repository;

    @Mock
    private UserAccountRepository userAccountRepository;

    private LoyaltyRankService service;
    private UUID adminId;
    private UserAccount admin;

    @BeforeEach
    void setUp() {
        service = new LoyaltyRankService(repository, userAccountRepository);
        adminId = UUID.randomUUID();
        admin = new UserAccount();
    }

    @Test
    void deactivatingMiddleRankExpandsPreviousEffectiveRangeAndRenumbersOrders() {
        List<LoyaltyRank> ranks = seededRanks();
        LoyaltyRank silver = ranks.get(1);
        when(repository.findAllForUpdate()).thenReturn(ranks);
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(admin));

        LoyaltyRankResponse changed = service.changeActive(
                adminId,
                silver.getLoyaltyRankId(),
                false
        );

        assertFalse(changed.active());
        assertNull(changed.rankOrder());

        when(repository.findAllByOrderByMinimumPointsAsc()).thenReturn(ranks);
        LoyaltyRankListResponse list = service.list();
        assertEquals(2999L, responseNamed(list, "Bronze").maximumPoints());
        assertEquals(Integer.valueOf(2), responseNamed(list, "Gold").rankOrder());
    }

    @Test
    void deactivatingHighestRankExtendsPreviousRankToGlobalMaximum() {
        List<LoyaltyRank> ranks = seededRanks();
        LoyaltyRank diamond = ranks.get(3);
        when(repository.findAllForUpdate()).thenReturn(ranks);
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(admin));

        service.changeActive(adminId, diamond.getLoyaltyRankId(), false);

        when(repository.findAllByOrderByMinimumPointsAsc()).thenReturn(ranks);
        LoyaltyRankListResponse list = service.list();
        assertEquals(999999L, responseNamed(list, "Gold").maximumPoints());
    }

    @Test
    void protectedBronzeCannotBeDeactivated() {
        List<LoyaltyRank> ranks = seededRanks();
        LoyaltyRank bronze = ranks.get(0);
        when(repository.findAllForUpdate()).thenReturn(ranks);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.changeActive(adminId, bronze.getLoyaltyRankId(), false)
        );

        assertEquals("The protected first loyalty rank cannot be deactivated.", exception.getMessage());
        assertTrue(bronze.isActive());
    }

    @Test
    void editingBronzeMaximumAutomaticallyMovesSilverMinimum() {
        List<LoyaltyRank> ranks = seededRanks();
        LoyaltyRank bronze = ranks.get(0);
        when(repository.findAllForUpdate()).thenReturn(ranks);
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(admin));

        service.update(
                adminId,
                bronze.getLoyaltyRankId(),
                new UpdateLoyaltyRankRequest(
                        "Bronze",
                        0L,
                        1499L,
                        BigDecimal.ZERO
                )
        );

        assertEquals(1500L, ranks.get(1).getMinimumPoints());
    }

    @Test
    void newRankMustStartImmediatelyAfterConfiguredHighestRange() {
        List<LoyaltyRank> ranks = seededRanks();
        when(repository.findAllForUpdate()).thenReturn(ranks);
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(admin));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.create(
                        adminId,
                        new CreateLoyaltyRankRequest(
                                "Sapphire",
                                1000001L,
                                1999999L,
                                new BigDecimal("25")
                        )
                )
        );

        assertEquals("A new loyalty rank must start at 1000000 points.", exception.getMessage());
    }

    @Test
    void newRankIsActiveAndReceivesNextAutomaticOrder() {
        List<LoyaltyRank> ranks = seededRanks();
        when(repository.findAllForUpdate()).thenReturn(new ArrayList<>(ranks));
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(repository.saveAndFlush(any(LoyaltyRank.class))).thenAnswer(invocation -> {
            LoyaltyRank rank = invocation.getArgument(0);
            ReflectionTestUtils.setField(rank, "loyaltyRankId", UUID.randomUUID());
            rank.beforeInsert();
            return rank;
        });

        LoyaltyRankResponse created = service.create(
                adminId,
                new CreateLoyaltyRankRequest(
                        "Sapphire",
                        1000000L,
                        1999999L,
                        new BigDecimal("25")
                )
        );

        assertTrue(created.active());
        assertEquals(Integer.valueOf(5), created.rankOrder());
    }

    private LoyaltyRankResponse responseNamed(LoyaltyRankListResponse list, String name) {
        return list.items().stream()
                .filter(item -> item.rankName().equals(name))
                .findFirst()
                .orElseThrow();
    }

    private List<LoyaltyRank> seededRanks() {
        return new ArrayList<>(List.of(
                rank("Bronze", 0, 999, "0", true, true),
                rank("Silver", 1000, 2999, "5", true, false),
                rank("Gold", 3000, 5999, "10", true, false),
                rank("Diamond", 6000, 999999, "20", true, false)
        ));
    }

    private LoyaltyRank rank(
            String name,
            long minimum,
            long maximum,
            String discount,
            boolean active,
            boolean protectedRank
    ) {
        LoyaltyRank rank = new LoyaltyRank();
        ReflectionTestUtils.setField(rank, "loyaltyRankId", UUID.randomUUID());
        rank.setRankName(name);
        rank.setMinimumPoints(minimum);
        rank.setMaximumPoints(maximum);
        rank.setDiscountPercentage(new BigDecimal(discount));
        rank.setActive(active);
        rank.setProtectedRank(protectedRank);
        rank.beforeInsert();
        return rank;
    }
}
