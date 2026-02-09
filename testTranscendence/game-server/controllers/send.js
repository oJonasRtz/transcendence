
export function sendMesage(ws, message) {
	if (!ws || ws.readyState !== ws.OPEN || !ws.send) return;

	ws.send(JSON.stringify({...message, timestamp: Date.now()}));
}
