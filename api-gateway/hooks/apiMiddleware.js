/**
 * API Middleware - Detects if request expects JSON response
 *
 * This middleware marks requests that should receive JSON responses
 * instead of redirects. Used to support both EJS views and Next.js API calls.
 */

export async function detectApiRequest(req, reply) {
	// Check if request expects JSON response
	const acceptHeader = req.headers['accept'] || '';
	const contentType = req.headers['content-type'] || '';

	// Get Next.js frontend URL from environment (supports both dev and production)
	const nextjsUrl = process.env.NEXTJS_FRONTEND_URL || 'http://localhost:3042';

	// Extract hostname from URL for comparison (e.g., "localhost:3042" or "frontend.example.com")
	const nextjsHost = nextjsUrl.replace(/^https?:\/\//, '');

	// Mark as API request if:
	// 1. Accept header includes application/json
	// 2. Content-Type is application/json
	// 3. Request is from Next.js frontend (checks origin and referer)
	const isApiRequest =
		acceptHeader.includes('application/json') ||
		contentType.includes('application/json') ||
		req.headers['origin']?.includes(nextjsHost) ||
		req.headers['referer']?.includes(nextjsHost);

	// Store flag in request for hooks and controllers to check
	req.isApiRequest = isApiRequest;
	
	// Debug logging only for seeProfile
	if (req.url.includes('seeProfile')) {
		console.log('[detectApiRequest] URL:', req.url);
		console.log('[detectApiRequest] Accept:', acceptHeader);
		console.log('[detectApiRequest] Content-Type:', contentType);
		console.log('[detectApiRequest] isApiRequest:', isApiRequest);
		console.log('[detectApiRequest] Headers:', JSON.stringify({
			accept: req.headers['accept'],
			'content-type': req.headers['content-type'],
			cookie: req.headers['cookie'] ? 'present' : 'missing',
			origin: req.headers['origin'],
			referer: req.headers['referer']
		}, null, 2));
	}

	return; // Continue to next handler
}

/**
 * JSON Error Response Handler
 *
 * Formats errors for JSON API responses
 */
export function sendJsonError(reply, errors, statusCode = 400) {
	return reply.code(statusCode).send({
		success: [],
		error: Array.isArray(errors) ? errors : [errors]
	});
}

/**
 * JSON Success Response Handler
 *
 * Formats success messages for JSON API responses
 */
export function sendJsonSuccess(reply, data, statusCode = 200) {
	return reply.code(statusCode).send({
		success: Array.isArray(data) ? data : [data],
		error: []
	});
}
