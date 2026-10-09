/**
 * Every word the auth screens show. Keeping copy out of the components is what
 * makes adding a second language later a change to this file, not to the UI.
 */
export const authCopy = {
	login: {
		title: 'Welcome back',
		subtitle: 'Sign in to continue to your workspace.',
		email: 'Email',
		password: 'Password',
		remember: 'Remember me',
		submit: 'Sign in',
		failed: 'We could not sign you in. Please check your details and try again.',
		footerQuestion: 'New to Tazkflow?',
		footerAction: 'Create an account',
	},
	register: {
		title: 'Create your account',
		subtitle: 'One account works across every workspace you join.',
		name: 'Full name',
		email: 'Email',
		password: 'Password',
		passwordHint: 'At least 8 characters.',
		confirm: 'Confirm password',
		submit: 'Create account',
		footerQuestion: 'Already have an account?',
		footerAction: 'Sign in',
		failed: 'We could not create your account. Please check the form and try again.',
	},
	verify: {
		title: 'Confirm your email',
		subtitle: 'We sent a link to {email}. Open it to finish setting up your account.',
		why: 'Creating a workspace and joining an invitation both need a confirmed email.',
		resend: 'Send the link again',
		sent: 'Sent. Check your inbox.',
		sendFailed: 'We could not send the email. Please try again.',
		recheck: 'I have confirmed it',
		stillWaiting: 'Still not confirmed. Open the link in your email first.',
		signOut: 'Sign out',
	},
	verified: {
		title: 'Email confirmed',
		subtitle: 'Thanks — your email address is confirmed.',
		continue: 'Continue',
	},
	session: {
		title: 'You are signed in',
		subtitle: 'The workspace screens arrive in the next tasks.',
		signOut: 'Sign out',
	},
}
