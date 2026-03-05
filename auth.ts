import NextAuth from "next-auth"
import "next-auth/jwt"
import Asgardeo from "next-auth/providers/asgardeo"

interface AuthorizedProfile {
    email?: string
    given_name?: string
    family_name?: string
    username?: string
    org_id?: string
    org_name?: string
    org_handle?: string
    sub?: string
}



export const { handlers, auth, signIn, signOut } = NextAuth({
    theme: {
        colorScheme: "dark",
        logo: "https://authjs.dev/img/logo-sm.png" },
    debug: true,
    logger: {
        error(code, ...message) {
            console.error("AUTH ERROR CODE:", code)
            console.error("AUTH ERROR DETAIL:", JSON.stringify(message, null, 2))
        },
        // debug(code, ...message) {
        //   console.error("DEBUG AUTH CODE:", code)
        //   console.error("DEBUG AUTH DETAIL:", JSON.stringify(message, null, 2))
        // },
    },
    providers: [
        Asgardeo({
            clientId: process.env.ASGARDEO_CLIENT_ID,
            clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
            issuer: process.env.ASGARDEO_ISSUER,
            authorization: { params: { scope: "openid email phone profile roles" } },
        }),
    ],
    basePath: "/auth",
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ request, auth }) {
            const { pathname } = request.nextUrl
            if (pathname === "/middleware-example") return !!auth
            return true
        },
        jwt({ token, trigger, session, account, profile }) {
            if (trigger === "update") token.name = session.user.name
            if (account?.provider === "asgardeo") {
                const p = profile as AuthorizedProfile
                console.log("ASGARDEO PROFILE:", JSON.stringify(p, null, 2))
                return {
                    ...token,
                    accessToken: account.access_token,
                    email: p.email,
                    name: p.given_name,
                    family_name: p.family_name,
                    username: p.username,
                    org_id: p.org_id,
                    org_name: p.org_name,
                    org_handle: p.org_handle,
                    sub: p.sub,
                }
            }
            return token
        },
        session({ session, token }) {
            if (token?.accessToken) {
                console.log("ASGARDEO ACCESS TOKEN:", JSON.stringify(token))
                session.accessToken = token.accessToken
                if (token.sub) {
                    session.user.id = token.sub
                    console.log("ASGARDEO USER ID:", token.sub)
                } // Asgardeo user ID
                if (token.email) session.user.email = token.email
                if (token.name) session.user.name = token.name
                session.org_id = token.org_id
                session.org_name = token.org_name
                session.username = token.username
            }

            return session
        },
    },
    experimental: { enableWebAuthn: true },
})

declare module "next-auth" {
    interface Session {
        accessToken?: string
        org_id?: string
        org_name?: string
        username?: string
        family_name?: string
        sub?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        email?: string
        family_name?: string
        username?: string
        org_id?: string
        org_name?: string
        org_handle?: string
        sub?: string
    }
}
