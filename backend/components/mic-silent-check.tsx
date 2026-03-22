'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/lib/actions/tracking'

export function MicSilentCheck({ page }: { page: string }) {
    useEffect(() => {
        if (!navigator.mediaDevices?.getUserMedia) return

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                stream.getTracks().forEach((t) => t.stop())
                trackEvent(page, 'mic_accept')
            })
            .catch(() => {
                trackEvent(page, 'mic_deny')
            })
    }, [page])

    return null
}
