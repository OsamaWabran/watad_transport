import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tenant_code: { label: "كود المؤسسة", type: "text" },
        user_name: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.user_name || !credentials?.password) {
          throw new Error("اسم المستخدم وكلمة المرور مطلوبة");
        }

        const { tenant_code, user_name, password } = credentials;

        let tenantId: string | null = null;
        let tenantCode: string | undefined = undefined;

        try {
          if (tenant_code && tenant_code.trim() !== "") {
            const tenant = await prisma.tenant.findUnique({
              where: { code: tenant_code.trim() },
            });

            if (!tenant) {
              throw new Error("كود المؤسسة غير صحيح");
            }

            if (!tenant.is_active) {
              throw new Error("حساب هذه المؤسسة غير مفعل");
            }

            tenantId = tenant.id;
            tenantCode = tenant.code;
          }

          let user;
          if (tenantId) {
            user = await prisma.user.findFirst({
              where: {
                tenant_id: tenantId,
                user_name: user_name.trim(),
              },
              include: {
                user_roles: true,
                tenant: true,
              },
            });
          } else {
            user = await prisma.user.findFirst({
              where: {
                user_name: user_name.trim(),
              },
              include: {
                user_roles: true,
                tenant: true,
              },
            });
          }

          if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
              throw new Error("بيانات الدخول غير صحيحة");
            }

            const roles = user.user_roles.map((ur) => ur.role);

            return {
              id: user.id,
              user_name: user.user_name,
              full_name: user.full_name,
              phone_number: user.phone_number,
              tenant_id: user.tenant_id,
              tenant_code: tenantCode || user.tenant.code,
              roles,
            };
          }
        } catch (dbError: any) {
          console.error("Auth DB Error:", dbError.message);
          throw dbError;
        }

        throw new Error("بيانات الدخول غير صحيحة");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.user_name = user.user_name;
        token.full_name = user.full_name;
        token.phone_number = user.phone_number;
        token.tenant_id = user.tenant_id;
        token.tenant_code = user.tenant_code;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.user_name = token.user_name as string;
        session.user.full_name = token.full_name as string;
        session.user.phone_number = token.phone_number as string;
        session.user.tenant_id = token.tenant_id as string;
        session.user.tenant_code = token.tenant_code as string;
        session.user.roles = (token.roles as string[]) || [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
