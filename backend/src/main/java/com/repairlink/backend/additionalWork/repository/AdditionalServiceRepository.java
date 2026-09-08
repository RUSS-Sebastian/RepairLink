package com.repairlink.backend.additionalWork.repository;

import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AdditionalServiceRepository extends JpaRepository<AdditionalService, UUID> {

    @Query("""
            SELECT s FROM AdditionalService s
            WHERE (:search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:status IS NULL OR s.status = :status)
              AND (:applicability IS NULL OR s.applicability = :applicability)
            """)
    Page<AdditionalService> search(
            @Param("search") String search,
            @Param("status") AdditionalServiceStatus status,
            @Param("applicability") ServiceApplicability applicability,
            Pageable pageable
    );

    long countByStatus(AdditionalServiceStatus status);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndAdditionalServiceIdNot(String name, UUID id);

    List<AdditionalService> findByStatusAndApplicabilityInOrderByNameAsc(
            AdditionalServiceStatus status,
            List<ServiceApplicability> applicabilities
    );

    List<AdditionalService> findByStatusOrderByNameAsc(AdditionalServiceStatus status);
}
