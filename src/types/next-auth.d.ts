import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      mphone?: string
    } & DefaultSession
  }

  interface User extends DefaultUser {
    id: string
    mphone?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    mphone?: string
  }
}
