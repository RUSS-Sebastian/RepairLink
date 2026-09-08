package com.repairlink.backend.admin.dashboard.service;

import com.repairlink.backend.admin.dashboard.dto.AdminDashboardSummaryResponse;
import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final UserAccountRepository userAccountRepository;

    public AdminDashboardService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public AdminDashboardSummaryResponse getSummary() {
        return new AdminDashboardSummaryResponse(
                userAccountRepository.countActiveUsersByRole(
                    RoleCode.CUSTOMER
                )
        );
    }
}