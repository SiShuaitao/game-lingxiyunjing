package com.shixingxu.lingxi.controller.api;

import com.shixingxu.lingxi.common.Result;
import com.shixingxu.lingxi.entity.Game;
import com.shixingxu.lingxi.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 游戏元数据接口。
 * 灵汐云境专属站点：/api/game 返回唯一作品，/api/games 返回列表（兼容通用模式）。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/game")
    public Result<Game> first() {
        return Result.success(gameService.getFirst());
    }

    @GetMapping("/games")
    public Result<List<Game>> list() {
        return Result.success(gameService.listOnline());
    }
}
