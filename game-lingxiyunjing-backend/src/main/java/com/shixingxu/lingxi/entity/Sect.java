package com.shixingxu.lingxi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 门派实体。
 */
@Data
@TableName("sect")
public class Sect implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 门派名 */
    private String name;

    /** 副标题 */
    private String subtitle;

    /** 门派理念 */
    private String philosophy;

    /** 门派简介 */
    private String description;

    /** 门派大图背景渐变 */
    private String cover;

    /** 排序值 */
    private Integer sort;

    /** 1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
