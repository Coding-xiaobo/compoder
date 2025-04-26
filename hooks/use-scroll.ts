import { DependencyList, useCallback, useEffect, useRef } from "react"
import { RefObject } from "react"

export const useScrollToBottom = (
  ref: RefObject<HTMLDivElement>,
  deps: DependencyList,
) => {
  // 追踪是否用户手动滚动了
  const userHasScrolled = useRef(false)
  // 保存当前滚动位置
  const scrollPosition = useRef({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  })

  // 检查是否在底部或接近底部的帮助函数
  const isNearBottom = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = scrollPosition.current
    // 如果距离底部不超过50px，认为是在底部
    return scrollHeight - scrollTop - clientHeight < 50
  }, [])

  // 添加滚动事件监听器
  useEffect(() => {
    const viewport = ref.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement

    if (!viewport) return

    const handleScroll = () => {
      // 保存当前滚动信息
      scrollPosition.current = {
        scrollTop: viewport.scrollTop,
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
      }

      // 检测用户是否手动上滚了（只有当不在底部时才认为是手动上滚）
      if (!isNearBottom()) {
        userHasScrolled.current = true
      } else {
        userHasScrolled.current = false
      }
    }

    viewport.addEventListener("scroll", handleScroll)
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [ref, isNearBottom])

  const scrollToBottom = useCallback(() => {
    if (userHasScrolled.current) return // 如果用户手动滚动，不干预

    const viewport = ref.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement

    if (!viewport) return

    // 使用requestAnimationFrame确保在渲染后执行滚动
    requestAnimationFrame(() => {
      // 更新滚动状态信息
      scrollPosition.current = {
        scrollTop: viewport.scrollTop,
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
      }

      // 滚动到底部
      viewport.scrollTop = viewport.scrollHeight

      // 确保滚动生效，有时可能需要连续滚动几次
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight
      }, 0)
    })
  }, [ref])

  useEffect(() => {
    if (deps.length > 0) {
      scrollToBottom()
    }
  }, [scrollToBottom, ...deps])

  return scrollToBottom
}
