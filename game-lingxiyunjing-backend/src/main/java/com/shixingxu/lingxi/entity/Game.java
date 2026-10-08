package com.shixingxu.lingxi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 游戏作品实体。
 */
@Data
@TableName("game")
public class Game implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 游戏唯一标识，用于前端路由 */
    private String gameId;

    /** 游戏名称 */
    private String name;

    /** 副标题 / 英文标题 */
    private String subtitle;

    /** 分类标签，如：国风武侠 */
    private String category;

    /** 一句话标语 */
    private String tagline;

    /** 简短介绍 */
    private String summary;

    /** 详细介绍 */
    private String description;

    /** 跳转官网地址 */
    private String url;

    /** 封面渐变 / 图片地址 */
    private String cover;

    /** 视觉风格主题：inkpaint 国风 */
    private String style;

    /** 是否精选展示 */
    private Integer featured;

    /** 排序值，越小越靠前 */
    private Integer sort;

    /** 状态：1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
