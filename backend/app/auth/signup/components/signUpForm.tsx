'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { SigUpApiResponse } from '@/types/api'
import { Routes } from '@/config/routes'
import { signUpFormSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type SigUpResponse = { success: boolean; error?: string; data?: SigUpApiResponse }

type SignupFormProps = {
    onSignup: (name: string, email: string, password: string) => Promise<SigUpResponse>
}

export const SignUpForm = ({ onSignup }: SignupFormProps) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirm_password: '',
        },
    })

    const onSubmit = async (data: z.infer<typeof signUpFormSchema>) => {
        setLoading(true)

        const res = await onSignup(data.name, data.email, data.password)

        if (res?.error) {
            toast.error(res.error)
            setLoading(false)
            return
        } else {
            toast.success('Compte créé avec succès !')
            router.replace(Routes.login)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='border space-y-4 rounded-xl p-5 '>
                <div className='space-y-2 text-center'>
                    <span className='text-2xl font-bold'>Créer un compte</span>
                    <p>Rejoignez-nous en quelques secondes</p>
                </div>

                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className='space-y-2'>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input placeholder='Jean Dupont' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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

                <FormField
                    control={form.control}
                    name='confirm_password'
                    render={({ field }) => (
                        <FormItem className='space-y-2'>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <Input placeholder='••••••••' type='password' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className='w-full' type='submit' disabled={loading}>
                    {loading ? 'Création en cours...' : "S'inscrire"}
                </Button>
            </form>
        </Form>
    )
}
