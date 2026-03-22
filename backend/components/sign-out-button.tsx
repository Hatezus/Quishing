'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { authClient } from '@/config/auth-client'
import { Routes } from '@/config/routes'

import { Button } from './ui/button'

export const SignOutButton = () => {
    const router = useRouter()

    const handleLogOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    router.replace(Routes.home)
                },
            },
        })
    }

    return <Button onClick={handleLogOut}>Se déconnecter</Button>
}
