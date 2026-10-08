package com.shixingxu.lingxi.controller.api;

import com.shixingxu.lingxi.common.Result;
import com.shixingxu.lingxi.entity.Sect;
import com.shixingxu.lingxi.service.SectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sects")
@RequiredArgsConstructor
public class SectController {

    private final SectService sectService;

    @GetMapping
    public Result<List<Sect>> list() {
        return Result.success(sectService.listOnline());
    }
}
