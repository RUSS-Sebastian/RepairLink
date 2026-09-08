package com.repairlink.backend.security.auth.repository;

import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.common.enums.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository
        extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndUserIdNot(String email, UUID userId);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndUserIdNot(String phone, UUID userId);

        @Query("""
            select count(distinct userAccount.userId)
            from UserAccount userAccount
            join UserRole userRole on userRole.user = userAccount
                        where userRole.role.roleCode = :roleCode
                            and userRole.active = true
            """)
        long countActiveUsersByRole(
                        @Param("roleCode") RoleCode roleCode
        );
}