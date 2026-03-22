import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/config/auth'

export const { POST, GET } = toNextJsHandler(auth)
