package com.shixingxu.lingxi.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.lingxi.entity.Character;
import com.shixingxu.lingxi.mapper.CharacterMapper;
import com.shixingxu.lingxi.service.CharacterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterServiceImpl implements CharacterService {

    private final CharacterMapper characterMapper;

    @Override
    public List<Character> listOnline() {
        return characterMapper.selectList(new LambdaQueryWrapper<Character>()
                .eq(Character::getStatus, 1)
                .orderByAsc(Character::getSort)
                .orderByAsc(Character::getId));
    }
}
