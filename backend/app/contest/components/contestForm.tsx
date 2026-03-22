'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent } from '@/lib/actions/tracking'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const ContestForm = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        // On enregistre uniquement les headers — jamais le contenu du formulaire
        await trackEvent('/contest', 'form_submit')
        router.push('/contest/merci')
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                    <Label htmlFor='prenom' className='text-sm font-medium text-gray-600'>
                        Prénom
                    </Label>
                    <Input id='prenom' placeholder='Jean' required />
                </div>
                <div className='space-y-1'>
                    <Label htmlFor='nom' className='text-sm font-medium text-gray-600'>
                        Nom
                    </Label>
                    <Input id='nom' placeholder='Dupont' required />
                </div>
            </div>

            <div className='space-y-1'>
                <Label htmlFor='email' className='text-sm font-medium text-gray-600'>
                    Adresse e-mail
                </Label>
                <Input id='email' type='email' placeholder='jean.dupont@email.com' required />
            </div>

            <div className='space-y-1'>
                <Label htmlFor='telephone' className='text-sm font-medium text-gray-600'>
                    Téléphone
                </Label>
                <Input id='telephone' type='tel' placeholder='06.....' required />
            </div>

            <div className='flex items-start gap-2 pt-1'>
                <input id='cgu' type='checkbox' required className='mt-1 accent-[#f76530]' />
                <label htmlFor='cgu' className='text-xs text-gray-400'>
                    J'accepte les conditions générales du jeu concours et la politique de confidentialité de ESN81.
                </label>
            </div>

            <Button
                type='submit'
                disabled={loading}
                className='w-full bg-[#f76530] hover:bg-[#e05520] text-white font-bold py-3 rounded-xl text-base'>
                {loading ? 'Inscription en cours...' : '🎯 Je participe gratuitement'}
            </Button>
        </form>
    )
}
