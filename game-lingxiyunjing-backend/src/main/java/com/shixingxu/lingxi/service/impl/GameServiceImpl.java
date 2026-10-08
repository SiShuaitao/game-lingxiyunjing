package com.shixingxu.lingxi.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.lingxi.entity.Game;
import com.shixingxu.lingxi.mapper.GameMapper;
import com.shixingxu.lingxi.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameMapper gameMapper;

    @Override
    public List<Game> listOnline() {
        return gameMapper.selectList(new LambdaQueryWrapper<Game>()
                .eq(Game::getStatus, 1)
                .orderByAsc(Game::getSort)
                .orderByAsc(Game::getId));
    }

    @Override
    public Game getFirst() {
        return gameMapper.selectOne(new LambdaQueryWrapper<Game>()
                .eq(Game::getStatus, 1)
                .orderByAsc(Game::getSort)
                .orderByAsc(Game::getId)
                .last("LIMIT 1"));
    }
}
