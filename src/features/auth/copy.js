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
		forgot: 'Forgot password?',
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
	forgot: {
		title: 'Reset your password',
		subtitle: 'Enter your email and we will send you a link.',
		email: 'Email',
		submit: 'Send reset link',
		back: 'Back to sign in',
		// Neutral on purpose: it must not tell whether the address has an account.
		sent: 'If that email has an account, a reset link is on its way.',
		failed: 'We could not send the link. Please try again.',
	},
	reset: {
		title: 'Choose a new password',
		subtitle: 'Enter a new password for {email}.',
		password: 'New password',
		passwordHint: 'At least 8 characters.',
		confirm: 'Confirm new password',
		submit: 'Save password',
		done: 'Your password has been changed. You can sign in now.',
		signIn: 'Go to sign in',
		brokenLink: 'This link is not complete. Ask for a new reset email.',
		newLink: 'Send me a new link',
		failed: 'We could not change your password. The link may have expired.',
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
	unreachable: {
		title: 'We can’t reach Tazkflow',
		subtitle: 'Check your internet connection. If it is working, Tazkflow may be restarting — try again in a moment.',
		retry: 'Try again',
		stillDown: 'Still no answer. Wait a moment and try again.',
	},
	verified: {
		confirmed: {
			title: 'Email confirmed',
			subtitle: 'Thanks — your email address is confirmed.',
			action: 'Continue',
		},
		linkInvalid: {
			title: 'This link no longer works',
			subtitle: 'It may have expired, or a newer link was sent after it. Ask for a new one and use the latest email.',
			action: 'Send a new link',
		},
		emailTaken: {
			title: 'That address is already in use',
			subtitle: 'Another account signed up with it before you confirmed. Your email address was not changed.',
			action: 'Continue',
		},
	},
}
