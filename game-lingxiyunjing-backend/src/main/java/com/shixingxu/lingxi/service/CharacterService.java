package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.Character;

import java.util.List;

public interface CharacterService {

    /** 获取所有已上线侠客，按 sort 升序 */
    List<Character> listOnline();
}
