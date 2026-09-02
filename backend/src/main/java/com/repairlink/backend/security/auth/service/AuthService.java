package com.repairlink.backend.security.auth.service;

import com.repairlink.backend.common.enums.AccountStatus;
import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.common.exception.EmailAlreadyExistsException;
import com.repairlink.backend.common.exception.InvalidCredentialsException;
import com.repairlink.backend.common.exception.PhoneAlreadyExistsException;
import com.repairlink.backend.security.auth.dto.CustomerProfileResponse;
import com.repairlink.backend.security.auth.dto.LoginRequest;
import com.repairlink.backend.security.auth.dto.LoginResponse;
import com.repairlink.backend.security.auth.dto.SignupRequest;
import com.repairlink.backend.security.auth.dto.UpdateCustomerProfileRequest;
import com.repairlink.backend.security.auth.dto.UserResponse;
import com.repairlink.backend.security.auth.entity.Role;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.entity.UserRole;
import com.repairlink.backend.security.auth.repository.RoleRepository;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.security.auth.repository.UserRoleRepository;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VehicleRepository vehicleRepository;

    public AuthService(
            UserAccountRepository userAccountRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            VehicleRepository vehicleRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public UserResponse signup(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = request.phone().trim();

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyExistsException();
        }

        if (userAccountRepository.existsByPhone(normalizedPhone)) {
            throw new PhoneAlreadyExistsException();
        }

        Role customerRole = roleRepository
                .findByRoleCode(RoleCode.CUSTOMER)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "CUSTOMER role is not configured."
                        )
                );

        UserAccount user = new UserAccount();
        user.setFullName(normalizeFullName(request.fullName()));
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.setAccountStatus(AccountStatus.ACTIVE);

        UserAccount savedUser = userAccountRepository.save(user);

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(customerRole);
        userRoleRepository.save(userRole);

        return toUserResponse(savedUser, customerRole.getRoleCode());
    }

    @Transactional
    public LoginResponse authenticate(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        UserAccount user = userAccountRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches ||
                user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new InvalidCredentialsException();
        }

        List<UserRole> activeRoles =
                userRoleRepository.findAllByUserUserIdAndActiveTrue(
                        user.getUserId()
                );

        RoleCode roleCode = activeRoles
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .map(Role::getRoleCode)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "The user has no active role."
                        )
                );

        user.setLastLoginAt(Instant.now());

        UserResponse userResponse = toUserResponse(user, roleCode);

    String accessToken = jwtService.generateToken(
            user,
            roleCode
    );

    return new LoginResponse(
            accessToken,
            "Bearer",
            userResponse
    );
    }

        @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        UserAccount user = userAccountRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists."
                        )
                );

        RoleCode roleCode = userRoleRepository
                .findAllByUserUserIdAndActiveTrue(userId)
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .map(Role::getRoleCode)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "The user has no active role."
                        )
                );

        return toUserResponse(user, roleCode);
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getCurrentCustomerProfile(UUID userId) {
        UserAccount user = userAccountRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists."
                        )
                );

        boolean isCustomer = userRoleRepository
                .findAllByUserUserIdAndActiveTrue(userId)
                .stream()
                .map(UserRole::getRole)
                .map(Role::getRoleCode)
                .anyMatch(RoleCode.CUSTOMER::equals);

        if (!isCustomer) {
            throw new IllegalStateException(
                    "Only customers can access this profile endpoint."
            );
        }

        return new CustomerProfileResponse(
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                formatMemberSince(user.getCreatedAt()),
                vehicleRepository.countByOwnerUserIdAndDeletedAtIsNull(userId)
        );
    }

    @Transactional
    public CustomerProfileResponse updateCurrentCustomerProfile(
            UUID userId,
            UpdateCustomerProfileRequest request
    ) {
        UserAccount user = userAccountRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists."
                        )
                );

        boolean isCustomer = userRoleRepository
                .findAllByUserUserIdAndActiveTrue(userId)
                .stream()
                .map(UserRole::getRole)
                .map(Role::getRoleCode)
                .anyMatch(RoleCode.CUSTOMER::equals);

        if (!isCustomer) {
            throw new IllegalStateException(
                    "Only customers can update this profile."
            );
        }

        String nextFullName = request.fullName() == null
                ? user.getFullName()
                : normalizeFullName(request.fullName());

        String nextEmail = request.email() == null
                ? user.getEmail()
                : normalizeEmail(request.email());

        String nextPhone = request.phone() == null
                ? user.getPhone()
                : request.phone().trim();

        if (request.fullName() != null && nextFullName.isBlank()) {
            throw new IllegalArgumentException("Full name cannot be blank.");
        }

        if (request.email() != null && nextEmail.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank.");
        }

        if (request.phone() != null && nextPhone.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be blank.");
        }

        if (request.email() != null && !nextEmail.equalsIgnoreCase(user.getEmail())
                && userAccountRepository.existsByEmailIgnoreCaseAndUserIdNot(nextEmail, userId)) {
            throw new EmailAlreadyExistsException();
        }

        if (request.phone() != null && !nextPhone.equalsIgnoreCase(user.getPhone())
                && userAccountRepository.existsByPhoneAndUserIdNot(nextPhone, userId)) {
            throw new PhoneAlreadyExistsException();
        }

        user.setFullName(nextFullName);
        user.setEmail(nextEmail);
        user.setPhone(nextPhone);

        UserAccount savedUser = userAccountRepository.save(user);

        return new CustomerProfileResponse(
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                formatMemberSince(savedUser.getCreatedAt()),
                vehicleRepository.countByOwnerUserIdAndDeletedAtIsNull(userId)
        );
    }

    private UserResponse toUserResponse(
            UserAccount user,
            RoleCode roleCode
    ) {
        return new UserResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                roleCode
        );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeFullName(String fullName) {
        return fullName
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String formatMemberSince(Instant createdAt) {
        if (createdAt == null) {
            return "";
        }

        return createdAt
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate()
                .toString();
    }
}
