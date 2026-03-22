export enum ApiStatus {
    Success = 'GENERIC_SUCCESS',
    Error = 'ERROR',
    Unauthorized = 'UNAUTHORIZED',
    Forbidden = 'FORBIDDEN',
    NotFound = 'NOT_FOUND',
    BadRequest = 'BAD_REQUEST',
    Conflict = 'CONFLICT',
    InternalServerError = 'INTERNAL_SERVER_ERROR',
}

export type ApiResponseSuccess<T> = {
    status: 'GENERIC_SUCCESS'
    code: string
    data: T
}

export type ApiResponseError = {
    status: 'ERROR'
    code: string
    error: string
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError

//Better Auth
export type SigUpApiResponse = {
    success: boolean
    error?: string | undefined
    data?: {
        res: {
            token: string | null
            user: {
                id: string
                email: string
                name: string
                image: string | null | undefined
                emailVerified: boolean
                createdAt: Date
                updatedAt: Date
            }
        }
    }
}

export type LoginApiResponse = {
    success: boolean
    error?: string
    data?: {
        res: {
            redirect: boolean
            token: string
            url: string | undefined
            user: {
                id: string
                email: string
                name: string
                image: string | null | undefined
                emailVerified: boolean
                createdAt: Date
                updatedAt: Date
            }
        }
    }
}
