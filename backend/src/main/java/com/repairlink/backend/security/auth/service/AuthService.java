package com.repairlink.backend.security.auth.service;

import com.repairlink.backend.common.enums.AccountStatus;
import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.common.exception.EmailAlreadyExistsException;
import com.repairlink.backend.common.exception.InvalidCredentialsException;
import com.repairlink.backend.common.exception.PhoneAlreadyExistsException;
import com.repairlink.backend.security.auth.dto.LoginRequest;
import com.repairlink.backend.security.auth.dto.SignupRequest;
import com.repairlink.backend.security.auth.dto.UserResponse;
import com.repairlink.backend.security.auth.dto.LoginResponse;
import com.repairlink.backend.security.auth.entity.Role;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.entity.UserRole;
import com.repairlink.backend.security.auth.repository.RoleRepository;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.security.auth.repository.UserRoleRepository;
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

    public AuthService(
            UserAccountRepository userAccountRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
}