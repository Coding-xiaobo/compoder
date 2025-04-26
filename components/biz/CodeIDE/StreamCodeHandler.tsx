import { startTransition, useEffect, useRef } from "react"
import { FileContextType, useFile } from "./context/FileContext"
import { parseStreamingArtifact } from "@/lib/xml-message-parser/artifact-stream-parser"
import { FileNode, StreamCodeIDEProps } from "./interface"

interface ParseStatus {
  content: string
  status: "beforeArtifactStart" | "artifactStart"
}

export const StreamCodeHandler = ({
  isStreaming,
  readableStream,
  // 只输出 流中 Artifact之前的内容，也就是推理过程
  onCompoderThinkingProcess,
  children,
}: {
  isStreaming?: boolean
  readableStream?: ReadableStream
  children: React.ReactNode
  onCompoderThinkingProcess?: StreamCodeIDEProps["onCompoderThinkingProcess"]
}) => {
  const { currentFile, setFiles, setCurrentFile, updateFileContent } = useFile()

  const parseStatusRef = useRef<ParseStatus>({
    content: "",
    status: "beforeArtifactStart",
  })
  const handleFlagRef = useRef(false)
  const currentFileRef = useRef<FileNode | null>(null)
  // updateFileContent方法会形成闭包，所以需要用ref来保存
  const currentUpdateFileContentRef = useRef<
    FileContextType["updateFileContent"] | null
  >(null)
  const currentOnThinkingProcess = useRef<
    StreamCodeIDEProps["onCompoderThinkingProcess"]
  >(onCompoderThinkingProcess)

  // 添加防抖计时器，减少过于频繁的更新
  const updateThrottleTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 添加缓存最新内容的引用
  const latestContentRef = useRef<string>("")

  currentUpdateFileContentRef.current = updateFileContent
  currentFileRef.current = currentFile
  currentOnThinkingProcess.current = onCompoderThinkingProcess

  // 防抖更新文件内容
  const throttleUpdateFileContent = (fileId: string, content: string) => {
    latestContentRef.current = content

    // 如果已经有计时器，清除它
    if (updateThrottleTimerRef.current) {
      clearTimeout(updateThrottleTimerRef.current)
    }

    // 设置新的计时器，16ms（约一帧的时间）
    updateThrottleTimerRef.current = setTimeout(() => {
      if (currentUpdateFileContentRef.current) {
        startTransition(() =>
          currentUpdateFileContentRef.current?.(fileId, latestContentRef.current)
        )
      }
      updateThrottleTimerRef.current = null
    }, 16)
  }

  useEffect(() => {
    if (!isStreaming || !readableStream || handleFlagRef.current) return

    handleFlagRef.current = true

    // 重置状态
    parseStatusRef.current = {
      content: "",
      status: "beforeArtifactStart",
    }
    latestContentRef.current = ""

    parseStreamingArtifact({
      stream: readableStream,
      onChunk(chunk) {
        if (parseStatusRef.current.status !== "beforeArtifactStart") return
        parseStatusRef.current.content += chunk
        currentOnThinkingProcess.current?.(parseStatusRef.current.content)
      },
      onArtifactStart(artifact) {
        parseStatusRef.current.status = "artifactStart"
        currentOnThinkingProcess.current?.("")
      },
      onArtifactEnd(artifact) {
        setFiles(artifact.files)
        handleFlagRef.current = false

        // 清理防抖计时器
        if (updateThrottleTimerRef.current) {
          clearTimeout(updateThrottleTimerRef.current)
          updateThrottleTimerRef.current = null
        }
      },
      onFileStart(file, artifact) {
        setFiles(artifact.files)
        setCurrentFile(file)
      },
      onFileContent(content, file) {
        if (!currentFileRef.current || currentFileRef.current.id !== file.id)
          return

        // 使用防抖更新内容而不是直接更新
        throttleUpdateFileContent(file.id, content)
      },
      onError(error) {
        handleFlagRef.current = false
        parseStatusRef.current = {
          content: "",
          status: "beforeArtifactStart",
        }

        // 清理防抖计时器
        if (updateThrottleTimerRef.current) {
          clearTimeout(updateThrottleTimerRef.current)
          updateThrottleTimerRef.current = null
        }
      },
      onEnd() {
        handleFlagRef.current = false
        parseStatusRef.current = {
          content: "",
          status: "beforeArtifactStart",
        }

        // 清理防抖计时器
        if (updateThrottleTimerRef.current) {
          clearTimeout(updateThrottleTimerRef.current)
          updateThrottleTimerRef.current = null
        }
      },
    })

    // 清理函数
    return () => {
      if (updateThrottleTimerRef.current) {
        clearTimeout(updateThrottleTimerRef.current)
        updateThrottleTimerRef.current = null
      }
    }
  }, [isStreaming, readableStream])

  return children
}
