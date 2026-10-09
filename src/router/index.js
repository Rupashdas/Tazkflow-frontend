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
			path: '/',
			name: 'session',
			component: () => import('@/features/auth/SessionScreen.vue'),
			meta: { requiresAuth: true },
		},
	],
})

router.beforeEach(authGuard)
