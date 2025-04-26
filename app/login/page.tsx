"use client"

import Loading from "@/components/biz/Loading/Loading"
import LoginForm from "@/components/biz/LoginForm/LoginForm"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const { status, data: session, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("会话状态:", status);
    if (status === "authenticated") {
      console.log("用户已认证，会话数据:", session);
    }
  }, [status, session]);

  if (status === "loading") {
    console.log("正在加载会话...");
    return <Loading fullscreen />
  }

  if (status === "authenticated") {
    console.log("用户已认证，准备重定向到/main页面");
    redirect("/main")
  }

  const handleCredentialsSignIn = async (data: { username: string; password: string }) => {
    try {
      console.log("开始登录流程，用户名:", data.username);
      setCredentialsLoading(true)

      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      console.log("登录结果:", result);

      if (result?.error) {
        console.error("登录失败:", result.error);
        toast.error("登录失败：用户名或密码错误")
        setCredentialsLoading(false)
      } else if (result?.ok) {
        console.log("登录成功，准备更新会话...");
        toast.success("登录成功")

        await update();
        console.log("会话已更新，当前状态:", status);

        window.location.href = "/main";
      }
    } catch (error) {
      console.error("登录过程中发生异常:", error);
      toast.error("登录时发生错误")
      setCredentialsLoading(false)
    }
  }

  return (
    <LoginForm
      loading={credentialsLoading}
      onCredentialsSignIn={handleCredentialsSignIn}
    />
  )
}
