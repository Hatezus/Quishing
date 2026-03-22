'use server'

import { prisma } from '@/config/prisma'

export async function trackEvent(page: string, action: string) {
    await prisma.trackingEvent.create({
        data: { page, action },
    })
}

export async function resetTracking() {
    await prisma.trackingEvent.deleteMany()
}

export async function getMetrics() {
    const [grouped, recentEvents] = await Promise.all([
        prisma.trackingEvent.groupBy({
            by: ['page', 'action'],
            _count: { id: true },
            orderBy: [{ page: 'asc' }, { action: 'asc' }],
        }),
        prisma.trackingEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
        }),
    ])

    return { grouped, recentEvents }
}
