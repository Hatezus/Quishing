'use server'

import { headers } from 'next/headers'
import { APIError } from 'better-auth/api'

import { auth } from '@/config/auth'

export async function signInWithEmailAndPassword(email: string, password: string) {
    try {
        const res = await auth.api.signInEmail({
            headers: headers(),
            body: {
                email,
                password,
            },
        })

        return { success: true, data: { res } }
    } catch (err) {
        if (err instanceof APIError) {
            return { success: false, error: err.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function signUpWithEmailAndPassword(name: string, email: string, password: string) {
    try {
        const res = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
        })

        return { success: true, data: { res } }
    } catch (err) {
        if (err instanceof APIError) {
            return { success: false, error: err.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}
