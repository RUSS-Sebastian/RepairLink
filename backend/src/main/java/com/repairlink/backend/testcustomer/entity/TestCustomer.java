package com.repairlink.backend.testcustomer.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "test_customer")
public class TestCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    public TestCustomer() {
    }

    public TestCustomer(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}