package com.creditboost.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:5174")
public class TestController {
    
    @GetMapping("/test")
    public String test() {
        return "Hello World";
    }
}