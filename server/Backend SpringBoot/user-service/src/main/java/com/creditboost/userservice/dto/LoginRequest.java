package com.creditboost.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String email; // Changed from username to email

    @NotBlank
    private String password;
}