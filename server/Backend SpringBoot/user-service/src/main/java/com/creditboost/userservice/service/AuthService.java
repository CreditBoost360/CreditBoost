package com.creditboost.userservice.service;

import com.creditboost.userservice.dto.*;
import com.creditboost.userservice.model.User;
import com.creditboost.userservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    
    // In-memory user storage for development
    private static final Map<String, User> inMemoryUsers = new HashMap<>();
    
    @Value("${jwt.secret:replace-with-secure-key}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    public JwtResponse authenticate(LoginRequest req) {
        // Try in-memory users first
        User user = null;
        
        // Check in-memory users
        for (User u : inMemoryUsers.values()) {
            if (u.getEmail().equals(req.getEmail())) {
                user = u;
                break;
            }
        }
        
        // If not found in memory, try database
        if (user == null) {
            try {
                user = userRepo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            } catch (Exception e) {
                throw new RuntimeException("User not found");
            }
        }
        
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        String token = Jwts.builder()
            .setSubject(user.getEmail())
            .setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(key)
            .compact();
            
        return new JwtResponse(token, user.getEmail(), user.getRole());
    }

    public String register(SignUpRequest req) {
        try {
            // Create user object
            User user = User.builder()
                .id(UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE)
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("ROLE_USER")
                .build();
            
            // Store in memory
            inMemoryUsers.put(user.getEmail(), user);
            
            // Try to save to database if possible
            try {
                userRepo.save(user);
            } catch (Exception e) {
                // Ignore database errors - we already saved in memory
                System.out.println("Database save failed, but user is stored in memory: " + e.getMessage());
            }
            
            return "User registered successfully";
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
}