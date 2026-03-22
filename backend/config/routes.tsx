export const Routes = {
    home: '/',
    signup: '/auth/signup',
    login: '/auth/login',
    contest: '/contest',
    contestAdmin: '/contest/admin',
    profile: '/profile',
}

export const authRoutes = [Routes.signup, Routes.login]
export const protectedRoutes = [Routes.profile, Routes.contestAdmin]
