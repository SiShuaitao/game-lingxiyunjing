package com.shixingxu.lingxi.controller.api;

import com.shixingxu.lingxi.common.Result;
import com.shixingxu.lingxi.entity.Banner;
import com.shixingxu.lingxi.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public Result<List<Banner>> list() {
        return Result.success(bannerService.listVisible());
    }
}
