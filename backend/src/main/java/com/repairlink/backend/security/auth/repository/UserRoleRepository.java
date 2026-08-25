package com.repairlink.backend.security.auth.repository;

import com.repairlink.backend.security.auth.entity.UserRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRoleRepository
        extends JpaRepository<UserRole, UUID> {

    @EntityGraph(attributePaths = "role")
    List<UserRole> findAllByUserUserIdAndActiveTrue(UUID userId);
}