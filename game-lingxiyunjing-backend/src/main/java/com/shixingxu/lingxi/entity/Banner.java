package com.shixingxu.lingxi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 首页轮播 Banner 实体。
 */
@Data
@TableName("banner")
public class Banner implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String subtitle;

    /** 背景渐变或图片地址 */
    private String cover;

    /** 跳转链接 */
    private String link;

    /** 排序值 */
    private Integer sort;

    /** 1 显示 0 隐藏 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
