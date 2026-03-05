import { auth } from "@/auth"

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth

    // Redirect to signin if not logged in
    if (!isLoggedIn) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
        signInUrl.searchParams.append("callbackUrl", req.nextUrl.pathname)
        return Response.redirect(signInUrl)
    }
})

export const config = {
    matcher: [
        "/dashboard",
        "/dashboard/:path*",
        // Add other protected routes here
    ],
}