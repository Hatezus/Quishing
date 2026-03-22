'use client'

import { useEffect, useState } from 'react'

import { trackEvent } from '@/lib/actions/tracking'

export function NewsletterPopup() {
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 1500)
        return () => clearTimeout(t)
    }, [])

    function tryClose() {
        setClosing(true)
        setTimeout(() => {
            setClosing(false)
            setVisible(false)
            setTimeout(() => setVisible(true), 8000)
        }, 400)
    }

    if (!visible) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <div
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transition-transform duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                {/* Barre urgence */}
                <div className='bg-red-600 text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase animate-pulse'>
                    ⚠ Offre limitée — Ne ratez pas ça ⚠
                </div>

                {/* Contenu */}
                <div className='p-8 text-center space-y-4'>
                    <div className='text-5xl'>📬</div>
                    <h2 className='text-2xl font-extrabold text-gray-900 leading-tight'>
                        Inscrivez-vous à la newsletter ESN81 !
                    </h2>
                    <p className='text-gray-500 text-sm leading-relaxed'>
                        Rejoignez <strong>+1 200 abonnés</strong> et recevez en avant-première les annonces, résultats
                        du concours et invitations exclusives.
                    </p>

                    <form
                        onSubmit={(e) => { e.preventDefault(); trackEvent('/info', 'newsletter_subscribe'); setVisible(false) }}
                        className='flex flex-col gap-3 pt-2'>
                        <input
                            type='email'
                            required
                            placeholder='votre@email.fr'
                            className='w-full border-2 border-gray-200 focus:border-[#215265] rounded-xl px-4 py-3 text-sm outline-none transition-colors'
                        />
                        <button
                            type='submit'
                            className='w-full bg-[#f76530] hover:bg-[#e5582a] active:scale-95 transition-all text-white font-bold text-base py-3 rounded-xl'>
                            OUI, je m'abonne maintenant !
                        </button>
                    </form>

                    <button
                        onClick={tryClose}
                        className='text-xs text-gray-300 hover:text-gray-500 transition-colors underline underline-offset-2'>
                        Non merci, je préfère rater les annonces
                    </button>
                </div>
            </div>
        </div>
    )
}
