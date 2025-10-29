import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

console.log(`🔧 Setting up MSW worker with ${handlers.length} handlers`)

export const worker = setupWorker(...handlers);

export async function startMSW() {
	try {
		console.log('📡 Starting MSW worker...')
		const registration = await worker.start({
			serviceWorker: { 
				url: "/mockServiceWorker.js",
				options: {
					scope: '/'
				}
			},
			onUnhandledRequest: "bypass",
			quiet: false, // Show MSW logs for debugging
		});
		
		// Wait a bit for service worker to be fully active
		if (registration && 'installing' in registration) {
			console.log('⏳ Waiting for service worker to activate...')
			await new Promise(resolve => setTimeout(resolve, 500))
		}
		
		console.log('✅ MSW worker started and ready to intercept requests')
		console.log(`✅ Registered ${handlers.length} API handlers`)
		
		// Log all registered routes for debugging
		console.log('📋 Registered routes:')
		handlers.forEach((handler: any) => {
			if (handler.info) {
				console.log(`  - ${handler.info.method} ${handler.info.path}`)
			}
		})
		
		return true
	} catch (error) {
		console.error('❌ Failed to start MSW worker:', error)
		throw error
	}
}


