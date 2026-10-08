package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.Feature;

import java.util.List;

public interface FeatureService {

    /** 获取所有已上线玩法特色，按 sort 升序 */
    List<Feature> listOnline();
}
