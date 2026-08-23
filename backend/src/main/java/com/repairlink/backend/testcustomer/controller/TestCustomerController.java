package com.repairlink.backend.testcustomer.controller;

import com.repairlink.backend.testcustomer.entity.TestCustomer;
import com.repairlink.backend.testcustomer.repository.TestCustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-customers")
public class TestCustomerController {

    private final TestCustomerRepository repository;

    public TestCustomerController(TestCustomerRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<TestCustomer> create(
            @RequestBody TestCustomer customer) {

        TestCustomer saved = repository.save(customer);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<TestCustomer>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }
}