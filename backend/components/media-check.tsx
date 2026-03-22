'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/actions/tracking'

type Status = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

export function MediaCheck({ page }: { page: string }) {
    const [status, setStatus] = useState<Status>('idle')

    const requestAccess = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setStatus('unavailable')
            return
        }

        setStatus('loading')

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            // Libère immédiatement les pistes — on ne veut pas vraiment la caméra
            stream.getTracks().forEach((t) => t.stop())
            setStatus('granted')
            await trackEvent(page, 'camera_accept')
        } catch {
            setStatus('denied')
            await trackEvent(page, 'camera_deny')
        }
    }

    if (status === 'granted') {
        return (
            <div className='rounded-2xl bg-green-50 border border-green-200 p-5 flex items-start gap-4'>
                <span className='text-2xl'>✅</span>
                <div>
                    <p className='font-semibold text-green-800 text-sm'>Équipement vérifié avec succès</p>
                    <p className='text-xs text-green-600 mt-1'>
                        Votre caméra et votre microphone sont fonctionnels. Vous êtes prêt(e) pour le webinaire.
                    </p>
                </div>
            </div>
        )
    }

    if (status === 'denied') {
        return (
            <div className='rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4'>
                <span className='text-2xl'>⚠️</span>
                <div>
                    <p className='font-semibold text-amber-800 text-sm'>Accès refusé</p>
                    <p className='text-xs text-amber-600 mt-1'>
                        Vous avez refusé l'accès à la caméra ou au microphone. Pour participer au webinaire, autorisez
                        l'accès dans les paramètres de votre navigateur puis rechargez la page.
                    </p>
                </div>
            </div>
        )
    }

    if (status === 'unavailable') {
        return (
            <div className='rounded-2xl bg-gray-50 border border-gray-200 p-5 text-xs text-gray-500'>
                Votre navigateur ne supporte pas l'accès aux médias. Veuillez utiliser Chrome ou Firefox.
            </div>
        )
    }

    return (
        <div className='rounded-2xl border-2 border-dashed border-[#215265]/30 bg-[#215265]/5 p-6 space-y-4'>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-[#215265] flex items-center justify-center text-white text-lg shrink-0'>
                    🎥
                </div>
                <div>
                    <p className='font-semibold text-[#215265] text-sm'>Vérification de votre équipement requise</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Nécessaire pour accéder au webinaire en direct</p>
                </div>
            </div>

            <p className='text-xs text-gray-500 leading-relaxed'>
                Avant de rejoindre la session, nous devons vérifier que votre caméra et votre microphone fonctionnent
                correctement. Cliquez sur le bouton ci-dessous — votre navigateur vous demandera l'autorisation d'accès.
            </p>

            <button
                onClick={requestAccess}
                disabled={status === 'loading'}
                className='w-full bg-[#f76530] hover:bg-[#e05520] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors'>
                {status === 'loading' ? 'Vérification en cours...' : '🎙️ Tester mon équipement'}
            </button>

            <p className='text-[10px] text-gray-400 text-center'>
                L'accès ne sera utilisé que pour le test. Aucun enregistrement n'est effectué.
            </p>
        </div>
    )
}
