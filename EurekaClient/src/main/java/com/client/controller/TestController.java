package com.client.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/test")
public class TestController {

    @RequestMapping(value = "/hi", method = RequestMethod.POST)
    public String hi() {
        System.out.println("hi everyone.");
        return "port:8081";
    }
}
