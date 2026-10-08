package com.shixingxu.lingxi;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 灵汐云境官网后端 API 服务启动入口。
 */
@SpringBootApplication
@MapperScan("com.shixingxu.lingxi.mapper")
public class LingxiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LingxiApplication.class, args);
    }
}
