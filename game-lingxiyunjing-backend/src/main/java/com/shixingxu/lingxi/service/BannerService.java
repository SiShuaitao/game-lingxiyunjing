package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.Banner;

import java.util.List;

public interface BannerService {

    /** 获取首页 Banner */
    List<Banner> listVisible();
}
