import { useEffect, useState, RefObject, useRef } from "react"
import { Monaco } from "@monaco-editor/react"

type EditorRef = RefObject<any>

/**
 * A hook to handle editor auto-scrolling behavior
 * Only auto-scrolls to the bottom when the editor is already scrolled to the bottom
 */
export function useEditorScroll(editorRef: EditorRef, contentDependency?: any) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)
  // 追踪用户是否手动滚动
  const userManuallyScrolled = useRef(false)
  // 记录上次更新时的内容长度
  const lastContentLength = useRef(0)

  // Function to check if editor is scrolled to bottom
  const isEditorAtBottom = () => {
    if (!editorRef.current) return false

    const editor = editorRef.current
    const scrollTop = editor.getScrollTop()
    const scrollHeight = editor.getScrollHeight()
    const clientHeight = editor.getLayoutInfo().height

    // Consider "at bottom" if within a larger threshold (50px) of the bottom
    const threshold = 50
    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  // Function to scroll to the bottom of the editor
  const scrollToBottom = () => {
    if (!editorRef.current) return

    // 使用requestAnimationFrame确保渲染完成后执行滚动
    requestAnimationFrame(() => {
      if (!editorRef.current) return

      const lineCount = editorRef.current.getModel().getLineCount()

      // 使用revealPositionInCenter以避免某些边缘情况
      editorRef.current.revealPositionInCenter({
        lineNumber: lineCount,
        column: 1
      })

      // 双重保险：确保滚动生效
      setTimeout(() => {
        if (!editorRef.current) return

        // 直接设置滚动位置到底部
        const scrollHeight = editorRef.current.getScrollHeight()
        const clientHeight = editorRef.current.getLayoutInfo().height
        editorRef.current.setScrollTop(scrollHeight - clientHeight)
      }, 10)
    })
  }

  // 检测内容是否增加
  useEffect(() => {
    if (!contentDependency || !editorRef.current) return

    const currentLength = String(contentDependency).length
    const hasIncreased = currentLength > lastContentLength.current

    lastContentLength.current = currentLength

    // 只有内容增加且用户未手动滚动时才自动滚动
    if (hasIncreased && !userManuallyScrolled.current) {
      scrollToBottom()
    }
  }, [contentDependency])

  // Effect to scroll to bottom when file content is updated, but only if already at bottom
  useEffect(() => {
    if (editorRef.current && isScrolledToBottom && !userManuallyScrolled.current) {
      scrollToBottom()
    }
  }, [contentDependency, isScrolledToBottom])

  // Add scroll event listener to track if editor is at bottom
  useEffect(() => {
    const handleScroll = () => {
      const atBottom = isEditorAtBottom()

      // 用户手动滚动检测逻辑
      if (!atBottom && isScrolledToBottom) {
        userManuallyScrolled.current = true
      } else if (atBottom) {
        // 如果用户滚动到底部，重置手动滚动标志
        userManuallyScrolled.current = false
      }

      setIsScrolledToBottom(atBottom)
    }

    if (editorRef.current) {
      const disposable = editorRef.current.onDidScrollChange(handleScroll)

      return () => {
        // Properly dispose the event listener to prevent memory leaks
        disposable.dispose()
      }
    }

    return undefined
  }, [editorRef.current])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    // 初始化状态
    setIsScrolledToBottom(true)
    userManuallyScrolled.current = false
    lastContentLength.current = 0

    // 如果编辑器已经有内容，设置内容长度
    if (editor && editor.getModel()) {
      lastContentLength.current = editor.getModel().getValue().length
    }
  }

  return {
    isScrolledToBottom,
    scrollToBottom,
    handleEditorDidMount,
  }
}
