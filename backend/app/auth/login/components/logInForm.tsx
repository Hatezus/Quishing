'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { LoginApiResponse } from '@/types/api'
import { Routes } from '@/config/routes'
import { signInFormSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type LoginResponse = { success: boolean; error?: string; data?: LoginApiResponse }

type SignInFormProps = {
    onLogin: (email: string, password: string) => Promise<LoginResponse>
}

export const LogInForm = ({ onLogin }: SignInFormProps) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof signInFormSchema>>({
        resolver: zodResolver(signInFormSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        setLoading(true)

        const res = await onLogin(data.email, data.password)

        if (res.error) {
            toast.error(res.error)
            setLoading(false)
        }

        if (res.success) {
            toast.success('Connexion réussie !')
            router.push(Routes.profile)
        }
    })

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className='border space-y-4 rounded-xl p-5 '>
                <div className='space-y-2 text-center'>
                    <span className=' text-2xl font-bold'>Connexion</span>
                    <p>Entrez vos identifiants pour accéder à votre compte</p>
                </div>

                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem className='space-y-2'>
                            <FormLabel>Adresse e-mail</FormLabel>
                            <FormControl>
                                <Input placeholder='exemple@email.com' type='email' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem className='space-y-2'>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input placeholder='••••••••' type='password' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className='w-full' type='submit' disabled={loading}>
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
            </form>
        </Form>
    )
}
