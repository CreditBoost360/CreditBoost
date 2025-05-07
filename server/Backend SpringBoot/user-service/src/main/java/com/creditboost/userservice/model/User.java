package com.creditboost.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;  // stored as BCrypt hash

    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String role;      // e.g. ROLE_USER, ROLE_ADMIN
}