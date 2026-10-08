package com.shixingxu.lingxi.controller.api;

import com.shixingxu.lingxi.common.Result;
import com.shixingxu.lingxi.entity.News;
import com.shixingxu.lingxi.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public Result<List<News>> latest(@RequestParam(defaultValue = "6") int limit) {
        return Result.success(newsService.getLatestNews(limit));
    }

    @GetMapping("/{id}")
    public Result<News> detail(@PathVariable Long id) {
        News news = newsService.getById(id);
        if (news == null) {
            throw new IllegalArgumentException("资讯不存在: " + id);
        }
        return Result.success(news);
    }
}
