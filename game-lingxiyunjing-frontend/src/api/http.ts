import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiResult } from '@/types'

// 全局 axios 实例：开发环境通过 vite proxy 转发到 http://localhost:8084
const http: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[http] 请求异常:', error?.message)
    return Promise.reject(error)
  }
)

/**
 * 通用 GET 请求封装，自动解包 ApiResult<T>。
 * 失败时返回 fallback，避免阻塞页面渲染。
 */
export async function get<T>(url: string, fallback: T, config?: AxiosRequestConfig): Promise<T> {
  try {
    const { data } = await http.get<ApiResult<T>>(url, config)
    if (data && data.code === 0) {
      return data.data
    }
    console.warn('[http] 业务异常:', data?.message)
    return fallback
  } catch (e) {
    return fallback
  }
}
