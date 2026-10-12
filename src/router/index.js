import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import('@/features/auth/LoginScreen.vue'),
			meta: { guestOnly: true },
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('@/features/auth/RegisterScreen.vue'),
			meta: { guestOnly: true },
		},
		{
			path: '/forgot-password',
			name: 'forgot-password',
			component: () => import('@/features/auth/ForgotPasswordScreen.vue'),
			meta: { guestOnly: true },
		},
		{
			path: '/reset-password',
			name: 'reset-password',
			component: () => import('@/features/auth/ResetPasswordScreen.vue'),
			meta: { guestOnly: true },
		},
		{
			path: '/verify-email',
			name: 'verify-email',
			component: () => import('@/features/auth/VerifyEmailScreen.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/email-verified',
			name: 'email-verified',
			component: () => import('@/features/auth/EmailVerifiedScreen.vue'),
		},
		{
			path: '/',
			name: 'landing',
			component: () => import('@/features/workspaces/LandingScreen.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/workspaces',
			name: 'workspaces',
			component: () => import('@/features/workspaces/WorkspacesScreen.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/welcome',
			name: 'welcome',
			component: () => import('@/features/onboarding/CreateWorkspaceScreen.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/:workspace',
			component: () => import('@/layouts/AppLayout.vue'),
			meta: { requiresAuth: true },
			children: [
				{
					path: '',
					name: 'home',
					component: () => import('@/features/home/HomeScreen.vue'),
				},
			],
		},
	],
})

router.beforeEach(authGuard)
