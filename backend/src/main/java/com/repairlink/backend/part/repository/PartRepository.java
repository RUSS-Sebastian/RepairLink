package com.repairlink.backend.part.repository;

import com.repairlink.backend.part.entity.PartStatus;
import com.repairlink.backend.part.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PartRepository extends JpaRepository<Part, UUID> {

    @Query("""
            SELECT p FROM Part p
            WHERE (:search = '' OR
                LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (
                :status = '' OR
                (:status = 'ACTIVE' AND p.status = com.repairlink.backend.part.entity.PartStatus.ACTIVE AND p.stockQuantity > 0) OR
                (:status = 'INACTIVE' AND p.status = com.repairlink.backend.part.entity.PartStatus.INACTIVE) OR
                (:status = 'ARCHIVED' AND p.status = com.repairlink.backend.part.entity.PartStatus.ARCHIVED) OR
                (:status = 'OUT_OF_STOCK' AND p.status = com.repairlink.backend.part.entity.PartStatus.ACTIVE AND p.stockQuantity = 0)
            )
            AND (:lowStock = false OR
                (p.status = com.repairlink.backend.part.entity.PartStatus.ACTIVE
                    AND p.stockQuantity > 0
                    AND p.stockQuantity <= p.reorderLevel))
            ORDER BY p.createdAt DESC
            """)
    Page<Part> search(
            @Param("search") String search,
            @Param("status") String status,
            @Param("lowStock") boolean lowStock,
            Pageable pageable
    );

    long countByStatus(PartStatus status);

    long countByStatusAndStockQuantityGreaterThan(PartStatus status, int stockQuantity);

    long countByStatusAndStockQuantity(PartStatus status, int stockQuantity);

    @Query("""
            SELECT COUNT(p) FROM Part p
            WHERE p.status = com.repairlink.backend.part.entity.PartStatus.ACTIVE
                AND p.stockQuantity > 0
                AND p.stockQuantity <= p.reorderLevel
            """)
    long countLowStock();

    boolean existsByPartNumber(String partNumber);

    boolean existsByPartNumberAndPartIdNot(String partNumber, UUID partId);
}