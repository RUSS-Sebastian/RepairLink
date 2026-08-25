package com.repairlink.backend.security.auth.filter;

import com.repairlink.backend.common.enums.AccountStatus;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.security.auth.repository.UserRoleRepository;
import com.repairlink.backend.security.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserAccountRepository userAccountRepository,
            UserRoleRepository userRoleRepository
    ) {
        this.jwtService = jwtService;
        this.userAccountRepository = userAccountRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.startsWith(BEARER_PREFIX)
                && SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

            String token = authorizationHeader
                    .substring(BEARER_PREFIX.length())
                    .trim();

            authenticateToken(token, request);
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateToken(
            String token,
            HttpServletRequest request
    ) {
        if (!jwtService.isTokenValid(token)) {
            return;
        }

        UUID userId = jwtService.extractUserId(token);

        userAccountRepository
                .findById(userId)
                .filter(user ->
                        user.getAccountStatus() == AccountStatus.ACTIVE
                )
                .ifPresent(user -> {
                    List<GrantedAuthority> authorities =
                            userRoleRepository
                                    .findAllByUserUserIdAndActiveTrue(
                                            userId
                                    )
                                    .stream()
                                    .map(userRole ->
                                            (GrantedAuthority)
                                                    new SimpleGrantedAuthority(
                                                            "ROLE_" +
                                                            userRole
                                                                    .getRole()
                                                                    .getRoleCode()
                                                                    .name()
                                                    )
                                    )
                                    .toList();

                    if (authorities.isEmpty()) {
                        return;
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId.toString(),
                                    null,
                                    authorities
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                });
    }
}