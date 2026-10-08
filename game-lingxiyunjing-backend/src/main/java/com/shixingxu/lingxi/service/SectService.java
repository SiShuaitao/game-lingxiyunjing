package com.shixingxu.lingxi.service;

import com.shixingxu.lingxi.entity.Sect;

import java.util.List;

public interface SectService {

    /** 获取所有已上线门派，按 sort 升序 */
    List<Sect> listOnline();
}
