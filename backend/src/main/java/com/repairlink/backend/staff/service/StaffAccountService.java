package com.repairlink.backend.staff.service;

import com.repairlink.backend.common.enums.AccountStatus;
import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.security.auth.entity.Role;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.entity.UserRole;
import com.repairlink.backend.security.auth.repository.RoleRepository;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.security.auth.repository.UserRoleRepository;
import com.repairlink.backend.staff.dto.CreateStaffAccountRequest;
import com.repairlink.backend.staff.dto.StaffAccountResponse;
import com.repairlink.backend.staff.dto.UpdateStaffAccountRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class StaffAccountService {

    public static final List<RoleCode> ALLOWED_STAFF_ROLES = List.of(
            RoleCode.CENTER_STAFF,
            RoleCode.MECHANIC,
            RoleCode.DELIVERY_STAFF
    );

    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffAccountService(
            UserAccountRepository userAccountRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public StaffAccountResponse createStaffAccount(CreateStaffAccountRequest request) {
        if (!ALLOWED_STAFF_ROLES.contains(request.role())) {
            throw new IllegalArgumentException("Invalid staff role: " + request.role() + ". Only CENTER_STAFF, MECHANIC, and DELIVERY_STAFF can be created.");
        }

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String phone = (request.phone() != null && !request.phone().isBlank()) ? request.phone().trim() : null;

        if (userAccountRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken.");
        }

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered.");
        }

        if (phone != null && userAccountRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number '" + phone + "' is already registered.");
        }

        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setFullName(request.fullName() != null && !request.fullName().isBlank() ? request.fullName().trim() : username);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAccountStatus(AccountStatus.ACTIVE);

        UserAccount savedUser = userAccountRepository.save(user);

        Role role = roleRepository.findByRoleCode(request.role())
                .orElseThrow(() -> new IllegalStateException("Role not configured in database: " + request.role()));

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);
        userRole.setActive(true);
        userRoleRepository.save(userRole);

        return toResponse(savedUser, role);
    }

    @Transactional(readOnly = true)
    public List<StaffAccountResponse> listStaffAccounts(RoleCode roleFilter, String search) {
        List<RoleCode> targetRoles = (roleFilter != null && ALLOWED_STAFF_ROLES.contains(roleFilter))
                ? List.of(roleFilter)
                : ALLOWED_STAFF_ROLES;

        List<UserRole> userRoles = userRoleRepository.findAllByRoleRoleCodeInAndActiveTrueOrderByUserCreatedAtDesc(targetRoles);

        String query = search != null ? search.trim().toLowerCase(Locale.ROOT) : "";

        return userRoles.stream()
                .filter(ur -> {
                    if (query.isEmpty()) return true;
                    UserAccount u = ur.getUser();
                    String un = u.getUsername() != null ? u.getUsername().toLowerCase(Locale.ROOT) : "";
                    String fn = u.getFullName() != null ? u.getFullName().toLowerCase(Locale.ROOT) : "";
                    String em = u.getEmail() != null ? u.getEmail().toLowerCase(Locale.ROOT) : "";
                    return un.contains(query) || fn.contains(query) || em.contains(query);
                })
                .map(ur -> toResponse(ur.getUser(), ur.getRole()))
                .toList();
    }

    public StaffAccountResponse updateStaffAccount(UUID userId, UpdateStaffAccountRequest request) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found: " + userId));

        UserRole currentRole = userRoleRepository.findFirstByUserUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new IllegalStateException("Staff account has no active role assignment."));

        if (!ALLOWED_STAFF_ROLES.contains(currentRole.getRole().getRoleCode())) {
            throw new SecurityException("Operation not permitted: Target account is not a staff member.");
        }

        if (!ALLOWED_STAFF_ROLES.contains(request.role())) {
            throw new IllegalArgumentException("Invalid staff role: " + request.role());
        }

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String phone = (request.phone() != null && !request.phone().isBlank()) ? request.phone().trim() : null;

        if (userAccountRepository.existsByUsernameIgnoreCaseAndUserIdNot(username, userId)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken by another user.");
        }

        if (userAccountRepository.existsByEmailIgnoreCaseAndUserIdNot(email, userId)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered by another user.");
        }

        if (phone != null && userAccountRepository.existsByPhoneAndUserIdNot(phone, userId)) {
            throw new IllegalArgumentException("Phone number '" + phone + "' is already registered by another user.");
        }

        user.setUsername(username);
        user.setFullName(request.fullName() != null && !request.fullName().isBlank() ? request.fullName().trim() : username);
        user.setEmail(email);
        user.setPhone(phone);

        if (request.accountStatus() != null) {
            user.setAccountStatus(request.accountStatus());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        UserAccount updatedUser = userAccountRepository.save(user);

        Role targetRole = currentRole.getRole();
        if (targetRole.getRoleCode() != request.role()) {
            targetRole = roleRepository.findByRoleCode(request.role())
                    .orElseThrow(() -> new IllegalStateException("Role not configured in database: " + request.role()));
            currentRole.setRole(targetRole);
            userRoleRepository.save(currentRole);
        }

        return toResponse(updatedUser, targetRole);
    }

    public void deleteStaffAccount(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found: " + userId));

        UserRole currentRole = userRoleRepository.findFirstByUserUserIdAndActiveTrue(userId)
                .orElse(null);

        if (currentRole == null || !ALLOWED_STAFF_ROLES.contains(currentRole.getRole().getRoleCode())) {
            throw new SecurityException("Operation not permitted: Target account is not a staff member.");
        }

        userRoleRepository.deleteAllByUserUserId(userId);
        userAccountRepository.delete(user);
    }

    public StaffAccountResponse toggleStaffStatus(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found: " + userId));

        UserRole currentRole = userRoleRepository.findFirstByUserUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new IllegalStateException("Staff account has no active role assignment."));

        if (!ALLOWED_STAFF_ROLES.contains(currentRole.getRole().getRoleCode())) {
            throw new SecurityException("Operation not permitted: Target account is not a staff member.");
        }

        AccountStatus newStatus = user.getAccountStatus() == AccountStatus.ACTIVE ? AccountStatus.INACTIVE : AccountStatus.ACTIVE;
        user.setAccountStatus(newStatus);
        UserAccount saved = userAccountRepository.save(user);

        return toResponse(saved, currentRole.getRole());
    }

    private StaffAccountResponse toResponse(UserAccount user, Role role) {
        return new StaffAccountResponse(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                role.getRoleCode(),
                role.getRoleName(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }
}

