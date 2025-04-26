import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise } from "@/lib/db/mongo"
import { Adapter } from "next-auth/adapters"
import { env } from "@/lib/env"
import { UserModel } from "@/lib/db/models/user"
import { connectToDatabase } from "@/lib/db/mongo"

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  providers: [
    CredentialsProvider({
      name: "账号密码",
      credentials: {
        username: { label: "用户名", type: "text", placeholder: "请输入用户名" },
        password: { label: "密码", type: "password", placeholder: "请输入密码" }
      },
      async authorize(credentials) {
        console.log("开始验证用户凭据...");
        await connectToDatabase();

        if (!credentials?.username || !credentials?.password) {
          console.log("凭据不完整，验证失败");
          return null;
        }

        // 查找用户
        const user = await UserModel.findOne({ username: credentials.username });

        if (!user) {
          console.log(`用户 ${credentials.username} 不存在，验证失败`);
          return null;
        }

        // 验证密码
        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          console.log(`用户 ${credentials.username} 密码不正确，验证失败`);
          return null;
        }

        console.log(`用户 ${credentials.username} 验证成功`);

        // 返回用户信息
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      console.log("JWT回调被调用", { token, user });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      console.log("会话回调被调用", { session, token });
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    signIn: ({ user }) => {
      console.log("登录事件", { user });
    },
    signOut: () => {
      console.log("登出事件");
    },
    createUser: (user) => {
      console.log("创建用户事件", user);
    },
  },
}
