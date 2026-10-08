package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.News;

import java.util.List;

public interface NewsService {

    /** 获取最新资讯，默认按发布时间倒序 */
    List<News> getLatestNews(int limit);

    /** 资讯详情 */
    News getById(Long id);
}
