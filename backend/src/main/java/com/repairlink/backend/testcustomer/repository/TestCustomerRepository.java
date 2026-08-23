package com.repairlink.backend.testcustomer.repository;

import com.repairlink.backend.testcustomer.entity.TestCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCustomerRepository
        extends JpaRepository<TestCustomer, Long> {
}