package com.shixingxu.lingxi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 兜底路由：访问根路径或非 /api 路径时，返回 index 视图。
 * 由前端 SPA 接管具体路由。
 */
@Controller
public class PageController {

    @GetMapping(value = {"/", "/news/**", "/about", "/characters", "/sects"})
    public String index() {
        return "forward:/index.html";
    }
}
