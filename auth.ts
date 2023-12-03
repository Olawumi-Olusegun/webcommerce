import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { SessionUserProfile, SignInCredentials } from "./app/types";

declare module "next-auth" {
    interface Session {
        user: SessionUserProfile
    }
}


const authConfig: NextAuthConfig = {
    providers: [CredentialsProvider({
        name: "credentials",
        credentials: {},
        async authorize(credentials, request) {
            const { email, password } = credentials as SignInCredentials;
            // send request to api route 
           const {user, error} = await fetch(`${process.env.BASE_URL}/api/users/signin`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(async (response) => await response.json())
            if(error) {
                // throw new Error(error)
                return null;
            }

            return { id: user?.id, ...user }
        }
    })],
    callbacks: {
        async jwt(params) {
            if(params?.user) {
                params.token = { ...params.token, ...params.user };
            }
            return params?.token;
        },
        async session(params) {
            const user = params?.token as typeof params.token & SessionUserProfile;
            if(user) {
                params.session.user = { 
                    ...params.session.user, 
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                    avatar: user?.avatar,
                    verified: user?.verified,
                    role: user?.role,
                }
            }
            return params?.session;
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        // signIn: "/auth/signin",
        // signOut: "/auth/signin"
    }
}

export const { auth, handlers: { GET, POST } } = NextAuth(authConfig);

