package com.shixingxu.lingxi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 玩法特色实体。
 */
@Data
@TableName("feature")
public class Feature implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 玩法标题 */
    private String title;

    /** 一句话概要 */
    private String summary;

    /** 玩法详细介绍 */
    private String description;

    /** 单字图标：剑/墨/雪/卷/境 */
    private String icon;

    /** 排序值 */
    private Integer sort;

    /** 1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
