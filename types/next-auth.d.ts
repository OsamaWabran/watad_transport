import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    tenant_id: string;
    tenant_code?: string;
    user_name: string;
    full_name: string;
    phone_number: string;
    roles: string[];
  }

  interface Session {
    user: {
      id: string;
      tenant_id: string;
      tenant_code?: string;
      user_name: string;
      full_name: string;
      phone_number: string;
      roles: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    tenant_id?: string;
    tenant_code?: string;
    user_name?: string;
    full_name?: string;
    phone_number?: string;
    roles?: string[];
  }
}
