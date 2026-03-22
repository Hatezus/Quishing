'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

import { authClient } from '@/config/auth-client'
import { Routes } from '@/config/routes'

import { Button } from './ui/button'

interface SingInOuthButtonProps {
    provider: 'google' | 'github'
    signUp?: boolean
    className?: string
}

export const SignInOauthButton = ({ provider, signUp, className }: SingInOuthButtonProps) => {
    const [isPending, setIsPending] = useState(false)

    async function handleClick() {
        await authClient.signIn.social({
            provider,
            callbackURL: Routes.profile,
            fetchOptions: {
                onRequest: () => {
                    setIsPending(true)
                },
                onResponse: () => {
                    setIsPending(false)
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
            },
        })
    }

    const action = signUp ? "S'enregistrer" : 'Se connecter'
    const providerName =
        provider === 'google' ? (
            <Image className='size-5 rounded-full fill-white' src='/google.svg' alt='google' width={56} height={56} />
        ) : (
            <Image className='size-5 rounded-full fill-white' src='/github.svg' alt='github' width={56} height={56} />
        )

    return (
        <Button onClick={handleClick} disabled={isPending} className={className}>
            {action}
            {providerName}
        </Button>
    )
}
