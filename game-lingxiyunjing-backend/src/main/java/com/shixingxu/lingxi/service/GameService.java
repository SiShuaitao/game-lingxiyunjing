package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.Game;

import java.util.List;

public interface GameService {

    /** 获取所有已上线作品，按 sort 升序 */
    List<Game> listOnline();

    /** 取第一条作品（灵汐云境专属站点仅一款） */
    Game getFirst();
}
