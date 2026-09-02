package com.repairlink.backend.security.auth.repository;

import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.security.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByRoleCode(RoleCode roleCode);
}