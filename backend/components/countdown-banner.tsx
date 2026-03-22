'use client'

import { useEffect, useState } from 'react'

function getTimeLeft(endDate: Date) {
    const diff = endDate.getTime() - Date.now()
    if (diff <= 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds }
}

export function CountdownBanner({ endDate: endDateStr }: { endDate: string }) {
    const endDate = new Date(endDateStr)
    const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

    useEffect(() => {
        setTimeLeft(getTimeLeft(endDate))
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(endDate))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    if (!timeLeft) return null

    const units = [
        { label: 'jours', value: timeLeft.days },
        { label: 'heures', value: timeLeft.hours },
        { label: 'min', value: timeLeft.minutes },
        { label: 'sec', value: timeLeft.seconds },
    ]

    const urgent = timeLeft.days < 3

    return (
        <div
            className={`w-full text-white py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 ${urgent ? 'bg-red-600 animate-pulse' : 'bg-red-600'}`}>
            {/* Message urgence */}
            <div className='flex items-center gap-2'>
                <span className='text-lg'>🚨</span>
                <span className='font-extrabold text-sm uppercase tracking-wide'>
                    {urgent ? 'DERNIÈRE CHANCE — Le concours ferme dans :' : 'Le concours ferme dans :'}
                </span>
            </div>

            {/* Chiffres */}
            <div className='flex items-center gap-2'>
                {units.map(({ label, value }, i) => (
                    <span key={label} className='flex items-center gap-1'>
                        <span className='bg-white/20 rounded-lg px-2.5 py-1 font-mono font-black text-xl tabular-nums min-w-[2.5rem] text-center'>
                            {String(value).padStart(2, '0')}
                        </span>
                        <span className='text-xs font-semibold opacity-80'>{label}</span>
                        {i < units.length - 1 && <span className='opacity-40 mx-1 text-lg font-bold'>:</span>}
                    </span>
                ))}
            </div>

            <span className='hidden sm:block text-sm font-bold bg-white text-red-600 px-3 py-1 rounded-full shrink-0'>
                Je participe →
            </span>
        </div>
    )
}
