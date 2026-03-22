'use client'

import { useEffect, useState } from 'react'

import { trackEvent } from '@/lib/actions/tracking'
import { Switch } from '@/components/ui/switch'

type Props = { page: string }

export function CookieConsent({ page }: Props) {
    const [visible, setVisible] = useState(false)
    const [showPanel, setShowPanel] = useState(false)

    useEffect(() => {
        const key = `cookie_consent_${page}`
        if (!localStorage.getItem(key)) setVisible(true)
    }, [page])

    const accept = async () => {
        localStorage.setItem(`cookie_consent_${page}`, 'accepted')
        setVisible(false)
        await trackEvent(page, 'cookie_accept')
    }

    const refuse = async () => {
        localStorage.setItem(`cookie_consent_${page}`, 'refused')
        setVisible(false)
        setShowPanel(false)
        await trackEvent(page, 'cookie_refuse')
    }

    if (!visible) return null

    return (
        <>
            {/* Overlay bloquant */}
            <div className='fixed inset-0 bg-black/40 z-40' />

            {/* Bandeau principal */}
            {!showPanel && (
                <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-6'>
                    <div className='max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center'>
                        <div className='flex-1 space-y-1'>
                            <p className='font-semibold text-gray-900 text-sm'>🍪 Ce site utilise des cookies</p>
                            <p className='text-xs text-gray-500 leading-relaxed'>
                                Nous et nos partenaires utilisons des cookies pour améliorer votre expérience, mesurer
                                notre audience, personnaliser les contenus et les publicités, et vous proposer des
                                fonctionnalités issues des réseaux sociaux. En cliquant sur « Tout accepter », vous
                                consentez à l'utilisation de l'ensemble de ces cookies conformément à notre{' '}
                                <span className='underline cursor-pointer'>politique de confidentialité</span>.
                            </p>
                        </div>
                        <div className='flex flex-col gap-2 shrink-0 w-full md:w-auto'>
                            {/* CTA principal — bien visible, orange */}
                            <button
                                onClick={accept}
                                className='bg-[#f76530] hover:bg-[#e05520] text-white font-bold px-8 py-3 rounded-lg text-sm w-full md:w-56 transition-colors'>
                                Tout accepter
                            </button>
                            {/* Option secondaire — petite, peu contrastée */}
                            <button
                                onClick={() => setShowPanel(true)}
                                className='text-xs text-gray-400 hover:text-gray-600 underline text-center py-1 transition-colors'>
                                Personnaliser mes préférences
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Panneau de personnalisation */}
            {showPanel && (
                <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl max-h-[80vh] overflow-y-auto'>
                    <div className='max-w-2xl mx-auto p-6 space-y-5'>
                        <div>
                            <h2 className='font-bold text-gray-900 text-base'>Paramètres des cookies</h2>
                            <p className='text-xs text-gray-400 mt-1'>
                                Vous pouvez gérer vos préférences. Certains cookies sont nécessaires au bon
                                fonctionnement du site et ne peuvent pas être désactivés.
                            </p>
                        </div>

                        {/* Cookies nécessaires — verrouillés */}
                        <CookieCategory
                            title='Cookies strictement nécessaires'
                            description='Indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.'
                            locked
                            defaultChecked
                        />

                        {/* Cookies optionnels — tous cochés par défaut */}
                        <CookieCategory
                            title="Cookies de mesure d'audience"
                            description="Nous permettent de mesurer les performances du site et d'améliorer votre expérience."
                            defaultChecked
                        />
                        <CookieCategory
                            title='Cookies de personnalisation'
                            description='Permettent de mémoriser vos préférences et de personnaliser les contenus affichés.'
                            defaultChecked
                        />
                        <CookieCategory
                            title='Cookies publicitaires et partenaires'
                            description="Utilisés par nos partenaires pour vous proposer des publicités adaptées à vos centres d'intérêt."
                            defaultChecked
                        />
                        <CookieCategory
                            title='Cookies de réseaux sociaux'
                            description="Permettent le partage sur les réseaux sociaux et l'affichage de contenus tiers."
                            defaultChecked
                        />

                        {/* Bouton principal — bien visible */}
                        <button
                            onClick={accept}
                            className='w-full bg-[#f76530] hover:bg-[#e05520] text-white font-bold py-3 rounded-lg text-sm transition-colors'>
                            Enregistrer mes préférences
                        </button>

                        {/* Refus — très discret, tout en bas */}
                        <div className='text-center pt-1 pb-2'>
                            <button
                                onClick={refuse}
                                className='text-[10px] text-gray-300 hover:text-gray-400 transition-colors'>
                                Continuer sans accepter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function CookieCategory({
    title,
    description,
    locked = false,
    defaultChecked = false,
}: {
    title: string
    description: string
    locked?: boolean
    defaultChecked?: boolean
}) {
    const [checked, setChecked] = useState(defaultChecked)

    return (
        <div className='flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0'>
            <div className='flex-1'>
                <p className='text-sm font-medium text-gray-800'>{title}</p>
                <p className='text-xs text-gray-400 mt-0.5'>{description}</p>
            </div>
            {locked ? (
                <span className='text-xs text-gray-300 mt-1 shrink-0'>Toujours actif</span>
            ) : (
                <Switch
                    checked={checked}
                    onCheckedChange={setChecked}
                    className='mt-1 shrink-0 data-[state=checked]:bg-[#215265]'
                />
            )}
        </div>
    )
}
