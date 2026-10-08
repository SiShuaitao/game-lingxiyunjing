import { onMounted, onBeforeUnmount } from 'vue'

/**
 * 滚动入场动画：监听 .reveal 元素，进入视口后添加 in-view 类。
 * 灵汐云境风格：水墨渐入 + 上移，营造卷轴展开之感。
 */
export function useReveal() {
  let observer: IntersectionObserver | null = null

  const init = () => {
    if (!('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => observer?.observe(el))
  }

  onMounted(() => {
    // 等 DOM 渲染完再绑定
    requestAnimationFrame(() => init())
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}

/** 在动态内容渲染后，重新扫描未激活的 reveal 元素 */
export function refreshReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'))
    return
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => obs.observe(el))
}
