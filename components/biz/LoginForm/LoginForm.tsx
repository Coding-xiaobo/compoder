"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { LoginFormProps } from "./interface"
import { Logo } from "../Logo"
import { techIcons } from "./helpers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const LoginForm = ({
  onSubmit,
  onGithubSignIn,
  onCredentialsSignIn,
  loading = false,
}: LoginFormProps) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (onCredentialsSignIn) {
      setFormLoading(true)
      onCredentialsSignIn({ username, password })
    } else if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-background to-background/95">
        <div
          className="absolute inset-0 bg-gradient-to-br from-violet-400/30 via-background to-violet-400/30 
          "
        />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[80%] h-full 
          rounded-2xl bg-background/40 backdrop-blur-sm
          before:absolute before:left-[16.67%] before:right-[16.67%] before:top-0 before:h-[1px]
          before:bg-gradient-to-r before:from-transparent before:via-violet-600/30 before:to-transparent"
          aria-hidden="true"
        />

        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] h-full 
          rounded-2xl bg-background/50 backdrop-blur-sm
          before:absolute before:left-[16.67%] before:right-[16.67%] before:top-0 before:h-[1px]
          before:bg-gradient-to-r before:from-transparent before:via-violet-600/60 before:to-transparent"
          aria-hidden="true"
        />

        <Card
          className="w-full p-4 sm:p-8 space-y-6 sm:space-y-8 relative
          bg-gradient-to-b from-background/80 to-background/70 backdrop-blur-sm border-[1.5px] border-border/40
          before:inset-0 before:-z-10 before:p-[1px]
          before:rounded-[inherit]
          after:absolute after:inset-0 after:-z-10
          after:bg-gradient-to-b after:from-background/90 after:to-background/80 after:rounded-[inherit]
          shadow-[0_2px_10px_rgba(0,0,0,0.1)]
          before:absolute before:left-[16.67%] before:right-[16.67%] before:top-[-1px] before:h-[1px]
          before:bg-gradient-to-r before:from-transparent before:via-violet-600/80 before:to-transparent"
        >
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl mx-auto flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
              <Logo
                width={64}
                height={64}
                className="sm:w-[72px] sm:h-[72px]"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              编解码器
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/90">
              在几秒钟内生成组件代码。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || formLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || formLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 font-medium"
              disabled={loading || formLoading}
            >
              {formLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              登录
            </Button>
          </form>

          <div className="text-center space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground/80">
            <p className="leading-relaxed">
              您的技术栈，您的 UI - 为每位
              <span className="text-primary"> 前端工程师</span>提供的 AI 驱动组件代码生成器
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-4 px-2 sm:px-4 pt-4 place-items-center">
            {techIcons.map((tech, index) => (
              <div
                key={index}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl
                  bg-background/80
                  flex items-center justify-center
                  transform ${tech.rotate} hover:rotate-0
                  hover:scale-110 transition-all duration-200
                  hover:shadow-lg hover:bg-background/95 cursor-pointer`}
                title={tech.name}
              >
                {tech.icon}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginForm
