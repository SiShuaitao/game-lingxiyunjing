package com.shixingxu.lingxi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 侠客（角色）实体。
 */
@Data
@TableName("`character`")
public class Character implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 侠客名 */
    private String name;

    /** 称号 */
    private String title;

    /** 所属门派 */
    private String faction;

    /** 定位：剑客/辅助/法师/射手/战士/刺客 */
    private String role;

    /** 难度：高/中/低 */
    private String difficulty;

    /** 侠客简介 */
    private String description;

    /** 立绘背景渐变 */
    private String cover;

    /** 排序值 */
    private Integer sort;

    /** 1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
