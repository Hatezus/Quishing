'use client'

import { useEffect, useState } from 'react'

type FingerprintData = {
    userAgent: string
    appName: string
    vendor: string
    platform: string
    language: string
    languages: string[]
    cookiesEnabled: boolean
    doNotTrack: string | null
    screenWidth: number
    screenHeight: number
    availWidth: number
    availHeight: number
    colorDepth: number
    devicePixelRatio: number
    orientation: string
    innerWidth: number
    innerHeight: number
    hardwareConcurrency: number
    deviceMemory: number | null
    connectionType: string | null
    connectionDownlink: number | null
    connectionRtt: number | null
    timezone: string
    timezoneOffset: number
    maxTouchPoints: number
    onLine: boolean
    mediaDevices: string[]
    canvasHash: string
    webglVendor: string
    webglRenderer: string
    fontsDetected: string[]
    notificationPermission: string | null
    localStorageAvailable: boolean
    sessionStorageAvailable: boolean
    indexedDBAvailable: boolean
    referrer: string
    currentUrl: string
    historyLength: number
    pdfViewerEnabled: boolean
}

function getCanvasHash(): string {
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 50
        const ctx = canvas.getContext('2d')
        if (!ctx) return 'N/A'
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#f60'
        ctx.fillRect(0, 0, 200, 50)
        ctx.fillStyle = '#069'
        ctx.fillText('Browser fingerprint 🔍', 2, 15)
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
        ctx.fillText('Browser fingerprint 🔍', 4, 17)
        const data = canvas.toDataURL()
        let hash = 0
        for (let i = 0; i < data.length; i++) {
            hash = (hash << 5) - hash + data.charCodeAt(i)
            hash |= 0
        }
        return Math.abs(hash).toString(16).toUpperCase()
    } catch {
        return 'N/A'
    }
}

function getWebGLInfo(): { vendor: string; renderer: string } {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (!gl || !(gl instanceof WebGLRenderingContext)) return { vendor: 'N/A', renderer: 'N/A' }
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        if (!ext) return { vendor: 'Inconnu', renderer: 'Inconnu' }
        return {
            vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'Inconnu',
            renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Inconnu',
        }
    } catch {
        return { vendor: 'N/A', renderer: 'N/A' }
    }
}

async function detectFonts(): Promise<string[]> {
    const list = [
        'Arial',
        'Verdana',
        'Helvetica',
        'Times New Roman',
        'Courier New',
        'Georgia',
        'Comic Sans MS',
        'Trebuchet MS',
        'Impact',
        'Tahoma',
        'Monaco',
        'Consolas',
        'Roboto',
        'Open Sans',
        'Ubuntu',
        'Segoe UI',
    ]
    const detected: string[] = []
    try {
        const fonts = (document as any).fonts
        if (fonts?.check) for (const f of list) if (fonts.check(`12px "${f}"`)) detected.push(f)
    } catch {
        /* ignore */
    }
    return detected
}

async function collectFingerprint(): Promise<FingerprintData> {
    const nav = navigator as any
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    const webgl = getWebGLInfo()
    const canvasHash = getCanvasHash()
    const fonts = await detectFonts()

    let mediaDevices: string[] = []
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        mediaDevices = devices.map((d) => `${d.kind}${d.label ? ` — ${d.label}` : ''}`)
    } catch {
        mediaDevices = ['Accès refusé']
    }

    let notificationPermission: string | null = null
    try {
        const perm = await navigator.permissions.query({ name: 'notifications' })
        notificationPermission = perm.state
    } catch {
        notificationPermission = 'N/A'
    }

    return {
        userAgent: navigator.userAgent,
        appName: navigator.appName,
        vendor: navigator.vendor,
        platform: navigator.platform,
        language: navigator.language,
        languages: [...navigator.languages],
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        screenWidth: screen.width,
        screenHeight: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || 'N/A',
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: nav.deviceMemory ?? null,
        connectionType: conn?.effectiveType ?? null,
        connectionDownlink: conn?.downlink ?? null,
        connectionRtt: conn?.rtt ?? null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
        onLine: navigator.onLine,
        mediaDevices,
        canvasHash,
        webglVendor: webgl.vendor,
        webglRenderer: webgl.renderer,
        fontsDetected: fonts,
        notificationPermission,
        localStorageAvailable: (() => {
            try {
                localStorage.setItem('_t', '1')
                localStorage.removeItem('_t')
                return true
            } catch {
                return false
            }
        })(),
        sessionStorageAvailable: (() => {
            try {
                sessionStorage.setItem('_t', '1')
                sessionStorage.removeItem('_t')
                return true
            } catch {
                return false
            }
        })(),
        indexedDBAvailable: !!window.indexedDB,
        referrer: document.referrer || 'Aucun',
        currentUrl: window.location.href,
        historyLength: window.history.length,
        pdfViewerEnabled: nav.pdfViewerEnabled ?? false,
    }
}

function R({ k, v, s }: { k: string; v: React.ReactNode; s?: boolean }) {
    return (
        <div className='flex gap-3 items-baseline py-1'>
            <span className='text-sm text-gray-400 shrink-0 w-40'>{k}</span>
            <span className={`text-sm font-mono break-all leading-snug ${s ? 'text-amber-700' : 'text-gray-700'}`}>
                {v}
            </span>
        </div>
    )
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
            {label}
        </span>
    )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-0.5'>
            <p className='text-xs font-black uppercase tracking-widest text-gray-400 mb-3'>{title}</p>
            {children}
        </div>
    )
}

export function FingerprintDisplay() {
    const [data, setData] = useState<FingerprintData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        collectFingerprint().then((fp) => {
            setData(fp)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className='flex-1 flex flex-col items-center justify-center gap-3'>
                <div className='w-8 h-8 border-4 border-[#215265] border-t-transparent rounded-full animate-spin' />
                <p className='text-gray-500 text-sm'>Analyse en cours…</p>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className='flex-1 overflow-hidden flex flex-col'>
            {/* Hash banner */}
            <div className='shrink-0 bg-[#215265] text-white px-6 py-3 flex items-center gap-8'>
                <div>
                    <p className='text-xs opacity-50 uppercase tracking-widest'>Empreinte canvas</p>
                    <p className='font-mono font-black text-2xl tracking-widest'>{data.canvasHash}</p>
                </div>
                <div className='flex gap-2 flex-wrap'>
                    <Chip ok={data.onLine} label={data.onLine ? 'En ligne' : 'Hors ligne'} />
                    <Chip ok={data.cookiesEnabled} label='Cookies' />
                    <Chip ok={data.localStorageAvailable} label='LocalStorage' />
                    <Chip ok={data.sessionStorageAvailable} label='SessionStorage' />
                    <Chip ok={data.indexedDBAvailable} label='IndexedDB' />
                    <Chip ok={data.pdfViewerEnabled} label='PDF viewer' />
                </div>
            </div>

            {/* Grid 3 colonnes */}
            <div className='flex-1 overflow-hidden grid grid-cols-3 gap-4 p-4'>
                {/* Col 1 */}
                <div className='flex flex-col gap-4 overflow-hidden'>
                    <Card title='🌐 Navigateur'>
                        <R k='User-Agent' v={data.userAgent} s />
                        <R k='App name' v={data.appName} />
                        <R k='Vendor' v={data.vendor || 'N/A'} />
                        <R k='Plateforme' v={data.platform} s />
                        <R k='Do Not Track' v={data.doNotTrack ?? 'Non défini'} />
                    </Card>
                    <Card title='🌍 Langue & Timezone'>
                        <R k='Langue' v={data.language} s />
                        <R k='Langues' v={data.languages.join(', ')} s />
                        <R k='Fuseau' v={data.timezone} s />
                        <R k='UTC offset' v={`UTC${data.timezoneOffset <= 0 ? '+' : ''}${-data.timezoneOffset / 60}h`} />
                    </Card>
                    <Card title='🔗 Navigation'>
                        <R k='URL' v={data.currentUrl} s />
                        <R k='Référent' v={data.referrer} s />
                        <R k='Historique' v={`${data.historyLength} page(s)`} />
                    </Card>
                </div>

                {/* Col 2 */}
                <div className='flex flex-col gap-4 overflow-hidden'>
                    <Card title='🖥️ Écran'>
                        <R k='Résolution' v={`${data.screenWidth} × ${data.screenHeight}`} s />
                        <R k='Disponible' v={`${data.availWidth} × ${data.availHeight}`} />
                        <R k='Fenêtre' v={`${data.innerWidth} × ${data.innerHeight}`} />
                        <R k='Couleur' v={`${data.colorDepth} bits`} />
                        <R k='DPI ratio' v={`${data.devicePixelRatio}x`} s />
                        <R k='Orientation' v={data.orientation} />
                    </Card>
                    <Card title='💻 Matériel'>
                        <R k='CPU cœurs' v={`${data.hardwareConcurrency}`} s />
                        <R k='RAM' v={data.deviceMemory !== null ? `≥ ${data.deviceMemory} Go` : 'N/A'} s />
                        <R k='Touch points' v={data.maxTouchPoints > 0 ? `${data.maxTouchPoints} pts` : 'Non tactile'} />
                    </Card>
                    <Card title='🎮 GPU / WebGL'>
                        <R k='Vendor' v={data.webglVendor} s />
                        <R k='Renderer' v={data.webglRenderer} s />
                    </Card>
                </div>

                {/* Col 3 */}
                <div className='flex flex-col gap-4 overflow-hidden'>
                    <Card title='📡 Réseau & Permissions'>
                        <R k='Type connexion' v={data.connectionType ?? 'N/A'} s />
                        <R k='Débit' v={data.connectionDownlink !== null ? `${data.connectionDownlink} Mbps` : 'N/A'} />
                        <R k='Latence (RTT)' v={data.connectionRtt !== null ? `${data.connectionRtt} ms` : 'N/A'} />
                        <R k='Notifications' v={data.notificationPermission ?? 'N/A'} />
                    </Card>
                    <Card title='📷 Périphériques médias'>
                        {data.mediaDevices.length === 0 ? (
                            <R k='Résultat' v='Aucun détecté' />
                        ) : (
                            data.mediaDevices.map((d, i) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <R key={i} k={`#${i + 1}`} v={d} s />
                            ))
                        )}
                    </Card>
                    <Card title='🔤 Polices détectées'>
                        <R
                            k={`${data.fontsDetected.length} police(s)`}
                            v={data.fontsDetected.length > 0 ? data.fontsDetected.join(', ') : 'Aucune'}
                            s
                        />
                    </Card>
                    <div className='bg-amber-50 border border-amber-200 rounded-xl p-4'>
                        <p className='text-xs font-black uppercase tracking-widest text-amber-600 mb-2'>
                            ⚠ Sans permission
                        </p>
                        <p className='text-sm text-amber-700 leading-relaxed'>
                            Toutes ces données ont été collectées <strong>automatiquement</strong> au chargement — sans aucune permission explicite.
                        </p>
                        <p className='text-sm text-amber-600 mt-2 leading-relaxed'>
                            Combinées, elles forment une <strong>empreinte unique</strong> permettant de vous identifier même sans cookies, même en navigation privée.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
