package com.shixingxu.lingxi.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.lingxi.entity.Feature;
import com.shixingxu.lingxi.mapper.FeatureMapper;
import com.shixingxu.lingxi.service.FeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureServiceImpl implements FeatureService {

    private final FeatureMapper featureMapper;

    @Override
    public List<Feature> listOnline() {
        return featureMapper.selectList(new LambdaQueryWrapper<Feature>()
                .eq(Feature::getStatus, 1)
                .orderByAsc(Feature::getSort)
                .orderByAsc(Feature::getId));
    }
}
