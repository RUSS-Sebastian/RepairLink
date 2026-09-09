package com.repairlink.backend.staff;

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
import com.repairlink.backend.staff.service.StaffAccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AdminStaffAccountIntegrationTest {

    @Autowired
    private StaffAccountService staffAccountService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testCreateStaffAccounts_AllStaffRoles() {
        // 1. Create Center Staff
        CreateStaffAccountRequest staffReq = new CreateStaffAccountRequest(
                "staff_alex",
                "Alex Center",
                "alex.center@gmail.com",
                "09111222333",
                RoleCode.CENTER_STAFF,
                "Password123!"
        );
        StaffAccountResponse staffRes = staffAccountService.createStaffAccount(staffReq);
        assertNotNull(staffRes.userId());
        assertEquals("staff_alex", staffRes.username());
        assertEquals("Alex Center", staffRes.fullName());
        assertEquals("alex.center@gmail.com", staffRes.email());
        assertEquals("09111222333", staffRes.phone());
        assertEquals(RoleCode.CENTER_STAFF, staffRes.role());
        assertEquals(AccountStatus.ACTIVE, staffRes.accountStatus());

        // 2. Create Mechanic (no phone)
        CreateStaffAccountRequest mechanicReq = new CreateStaffAccountRequest(
                "mechanic_mike",
                "Mike Mechanic",
                "mike.mechanic@gmail.com",
                null,
                RoleCode.MECHANIC,
                "Password123!"
        );
        StaffAccountResponse mechanicRes = staffAccountService.createStaffAccount(mechanicReq);
        assertNotNull(mechanicRes.userId());
        assertEquals("mechanic_mike", mechanicRes.username());
        assertEquals(RoleCode.MECHANIC, mechanicRes.role());
        assertNull(mechanicRes.phone());

        // 3. Create Delivery Staff / Driver
        CreateStaffAccountRequest driverReq = new CreateStaffAccountRequest(
                "driver_dan",
                "Dan Driver",
                "dan.driver@gmail.com",
                "09444555666",
                RoleCode.DELIVERY_STAFF,
                "Password123!"
        );
        StaffAccountResponse driverRes = staffAccountService.createStaffAccount(driverReq);
        assertNotNull(driverRes.userId());
        assertEquals("driver_dan", driverRes.username());
        assertEquals(RoleCode.DELIVERY_STAFF, driverRes.role());

        // Verify password hashing
        UserAccount user = userAccountRepository.findById(staffRes.userId()).orElseThrow();
        assertTrue(passwordEncoder.matches("Password123!", user.getPasswordHash()));
    }

    @Test
    void testCreateStaffAccount_DuplicateUsernameOrEmail() {
        CreateStaffAccountRequest req = new CreateStaffAccountRequest(
                "john_unique",
                "John Unique",
                "john.unique@gmail.com",
                null,
                RoleCode.CENTER_STAFF,
                "Password123!"
        );
        staffAccountService.createStaffAccount(req);

        // Duplicate username (case-insensitive)
        CreateStaffAccountRequest dupUserReq = new CreateStaffAccountRequest(
                "JOHN_UNIQUE",
                "John Dup",
                "other.email@gmail.com",
                null,
                RoleCode.CENTER_STAFF,
                "Password123!"
        );
        IllegalArgumentException exUser = assertThrows(IllegalArgumentException.class, () ->
                staffAccountService.createStaffAccount(dupUserReq));
        assertTrue(exUser.getMessage().contains("is already taken"));

        // Duplicate email (case-insensitive)
        CreateStaffAccountRequest dupEmailReq = new CreateStaffAccountRequest(
                "john_other",
                "John Dup",
                "JOHN.UNIQUE@GMAIL.COM",
                null,
                RoleCode.CENTER_STAFF,
                "Password123!"
        );
        IllegalArgumentException exEmail = assertThrows(IllegalArgumentException.class, () ->
                staffAccountService.createStaffAccount(dupEmailReq));
        assertTrue(exEmail.getMessage().contains("is already registered"));
    }

    @Test
    void testCreateStaffAccount_InvalidRoleRejected() {
        CreateStaffAccountRequest req = new CreateStaffAccountRequest(
                "admin_fake",
                "Fake Admin",
                "fake.admin@gmail.com",
                null,
                RoleCode.ADMIN,
                "Password123!"
        );
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                staffAccountService.createStaffAccount(req));
        assertTrue(ex.getMessage().contains("Invalid staff role"));
    }

    @Test
    void testListAndFilterStaffAccounts() {
        staffAccountService.createStaffAccount(new CreateStaffAccountRequest(
                "staff_one", "Alpha Staff", "alpha.staff@gmail.com", null, RoleCode.CENTER_STAFF, "Password123!"));
        staffAccountService.createStaffAccount(new CreateStaffAccountRequest(
                "mechanic_one", "Beta Mechanic", "beta.mech@gmail.com", null, RoleCode.MECHANIC, "Password123!"));

        // All staff
        List<StaffAccountResponse> all = staffAccountService.listStaffAccounts(null, null);
        assertTrue(all.size() >= 2);

        // Filter by role
        List<StaffAccountResponse> mechanics = staffAccountService.listStaffAccounts(RoleCode.MECHANIC, null);
        assertTrue(mechanics.stream().allMatch(s -> RoleCode.MECHANIC.equals(s.role())));
        assertTrue(mechanics.stream().anyMatch(s -> "mechanic_one".equals(s.username())));

        // Search by query
        List<StaffAccountResponse> searched = staffAccountService.listStaffAccounts(null, "Alpha");
        assertTrue(searched.stream().anyMatch(s -> "staff_one".equals(s.username())));
    }

    @Test
    void testUpdateStaffAccount() {
        StaffAccountResponse created = staffAccountService.createStaffAccount(new CreateStaffAccountRequest(
                "staff_upd", "Original Name", "original@gmail.com", "09111111111", RoleCode.CENTER_STAFF, "Password123!"));

        UpdateStaffAccountRequest updateReq = new UpdateStaffAccountRequest(
                "staff_upd",
                "Updated Name",
                "updated@gmail.com",
                "09222222222",
                RoleCode.MECHANIC,
                AccountStatus.ACTIVE,
                "NewPassword456!"
        );

        StaffAccountResponse updated = staffAccountService.updateStaffAccount(created.userId(), updateReq);
        assertEquals("Updated Name", updated.fullName());
        assertEquals("updated@gmail.com", updated.email());
        assertEquals("09222222222", updated.phone());
        assertEquals(RoleCode.MECHANIC, updated.role());

        // Verify password updated
        UserAccount user = userAccountRepository.findById(created.userId()).orElseThrow();
        assertTrue(passwordEncoder.matches("NewPassword456!", user.getPasswordHash()));
    }

    @Test
    void testToggleAccountStatus() {
        StaffAccountResponse created = staffAccountService.createStaffAccount(new CreateStaffAccountRequest(
                "staff_toggle", "Toggle Name", "toggle@gmail.com", null, RoleCode.CENTER_STAFF, "Password123!"));

        // Toggle from ACTIVE to INACTIVE
        StaffAccountResponse toggled = staffAccountService.toggleStaffStatus(created.userId());
        assertEquals(AccountStatus.INACTIVE, toggled.accountStatus());

        // Toggle back to ACTIVE
        StaffAccountResponse reactivated = staffAccountService.toggleStaffStatus(created.userId());
        assertEquals(AccountStatus.ACTIVE, reactivated.accountStatus());
    }

    @Test
    void testDeleteStaffAccount() {
        StaffAccountResponse created = staffAccountService.createStaffAccount(new CreateStaffAccountRequest(
                "staff_del", "To Delete", "todelete@gmail.com", null, RoleCode.DELIVERY_STAFF, "Password123!"));

        UUID userId = created.userId();
        assertTrue(userAccountRepository.existsById(userId));

        staffAccountService.deleteStaffAccount(userId);

        assertFalse(userAccountRepository.existsById(userId));
        assertTrue(userRoleRepository.findAll().stream().noneMatch(ur -> ur.getUser().getUserId().equals(userId)));
    }

    @Test
    void testDeleteSafeguards_CannotDeleteCustomerOrAdmin() {
        // Create a customer user directly
        Role customerRole = roleRepository.findByRoleCode(RoleCode.CUSTOMER).orElseThrow();
        UserAccount customer = new UserAccount();
        customer.setEmail("customer.test@gmail.com");
        customer.setFullName("Customer Test");
        customer.setPasswordHash(passwordEncoder.encode("Password123!"));
        customer.setAccountStatus(AccountStatus.ACTIVE);
        customer = userAccountRepository.save(customer);

        UserRole userRole = new UserRole();
        userRole.setUser(customer);
        userRole.setRole(customerRole);
        userRole.setActive(true);
        userRoleRepository.save(userRole);

        final UUID customerId = customer.getUserId();

        // Attempting to delete customer via staffAccountService must fail
        SecurityException ex = assertThrows(SecurityException.class, () ->
                staffAccountService.deleteStaffAccount(customerId));
        assertTrue(ex.getMessage().contains("Target account is not a staff member"));
    }
}
