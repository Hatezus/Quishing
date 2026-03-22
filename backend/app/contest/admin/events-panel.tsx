'use client'

import { useState } from 'react'

const ACTION_LABELS: Record<string, string> = {
    visit: 'Visite',
    form_submit: 'Formulaire soumis',
    cookie_accept: 'Cookies acceptés',
    cookie_refuse: 'Cookies refusés',
    camera_accept: 'Caméra/micro accepté',
    camera_deny: 'Caméra/micro refusé',
    mic_accept: 'Micro accepté',
    mic_deny: 'Micro refusé',
    newsletter_subscribe: 'Newsletter inscrit',
}

const ACTION_COLORS: Record<string, string> = {
    visit: 'text-[#215265]',
    form_submit: 'text-[#f76530]',
    cookie_accept: 'text-green-600',
    cookie_refuse: 'text-red-500',
    camera_accept: 'text-green-600',
    camera_deny: 'text-red-500',
    mic_accept: 'text-green-600',
    mic_deny: 'text-red-500',
    newsletter_subscribe: 'text-purple-600',
}

const ACTION_DOT: Record<string, string> = {
    visit: 'bg-[#215265]',
    form_submit: 'bg-[#f76530]',
    cookie_accept: 'bg-green-500',
    cookie_refuse: 'bg-red-500',
    camera_accept: 'bg-green-500',
    camera_deny: 'bg-red-500',
    mic_accept: 'bg-green-500',
    mic_deny: 'bg-red-500',
    newsletter_subscribe: 'bg-purple-500',
}

type Event = {
    id: string
    page: string
    action: string
    createdAt: Date
}

export function EventsPanel({ events }: { events: Event[] }) {
    const [fullscreen, setFullscreen] = useState(false)

    const displayed = fullscreen ? events : events.slice(0, 5)

    if (fullscreen) {
        return (
            <div className='fixed inset-0 z-50 bg-white flex flex-col'>
                <div className='shrink-0 px-6 py-4 border-b flex items-center justify-between bg-gray-50'>
                    <div>
                        <p className='font-bold text-gray-800'>Événements récents</p>
                        <p className='text-xs text-gray-400'>{events.length} événement(s)</p>
                    </div>
                    <button
                        onClick={() => setFullscreen(false)}
                        className='flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                        Fermer
                    </button>
                </div>
                <div className='flex-1 overflow-y-auto divide-y'>
                    {displayed.map((ev) => (
                        <div key={ev.id} className='px-6 py-3 flex items-center gap-4 hover:bg-gray-50'>
                            <span className={`w-3 h-3 rounded-full shrink-0 ${ACTION_DOT[ev.action] ?? 'bg-gray-400'}`} />
                            <span className='font-mono text-sm text-gray-400 w-28 shrink-0'>{ev.page}</span>
                            <span className={`text-sm font-semibold flex-1 ${ACTION_COLORS[ev.action] ?? 'text-gray-600'}`}>
                                {ACTION_LABELS[ev.action] ?? ev.action}
                            </span>
                            <span className='text-sm text-gray-300 shrink-0'>
                                {new Date(ev.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit', month: '2-digit',
                                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='shrink-0 border-t bg-white px-6 py-4'>
            <div className='flex items-center justify-between mb-3'>
                <p className='text-xs font-bold text-gray-400 uppercase tracking-wide'>
                    Événements récents <span className='text-gray-300 normal-case font-normal'>(5 / {events.length})</span>
                </p>
                <button
                    onClick={() => setFullscreen(true)}
                    className='flex items-center gap-1.5 text-xs font-semibold text-[#215265] hover:text-[#1a3f50] transition-colors'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' />
                    </svg>
                    Plein écran
                </button>
            </div>
            {displayed.length === 0 ? (
                <p className='text-sm text-gray-300'>Aucun événement.</p>
            ) : (
                <div className='flex gap-4'>
                    {displayed.map((ev) => (
                        <div key={ev.id} className='flex-1 bg-gray-50 rounded-xl px-4 py-3 flex flex-col gap-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ACTION_DOT[ev.action] ?? 'bg-gray-400'}`} />
                                <span className='font-mono text-xs text-gray-400 truncate'>{ev.page}</span>
                            </div>
                            <span className={`text-sm font-semibold truncate ${ACTION_COLORS[ev.action] ?? 'text-gray-600'}`}>
                                {ACTION_LABELS[ev.action] ?? ev.action}
                            </span>
                            <span className='text-xs text-gray-300'>
                                {new Date(ev.createdAt).toLocaleString('fr-FR', {
                                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
