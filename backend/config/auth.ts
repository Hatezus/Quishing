import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

import { prisma } from './prisma'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? '<Google_Client_ID>',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '<Google_Client_Secret>',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID ?? '<GitHub_Client_ID>',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '<GitHub_Client_Secret>',
        },
    },
    plugins: [nextCookies()],
})

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN'
