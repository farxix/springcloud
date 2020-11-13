package com.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 跨域：当域名www.abc.com下的js代码去访问www.def.com域名下的资源，就会受到限制。
 * 可以进行跨域请求
 */
@Controller
@CrossOrigin(value = "*")
public class PortalController {
    @RequestMapping(value = "/index")
    public String index() {
        return "index";
    }
}
