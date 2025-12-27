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

	// Mark as API request if:
	// 1. Accept header includes application/json
	// 2. Content-Type is application/json
	// 3. Request is from Next.js frontend (localhost:3042)
	const isApiRequest =
		acceptHeader.includes('application/json') ||
		contentType.includes('application/json') ||
		req.headers['origin']?.includes('localhost:3042') ||
		req.headers['referer']?.includes('localhost:3042');

	// Store flag in request for hooks and controllers to check
	req.isApiRequest = isApiRequest;

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
