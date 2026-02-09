/*
	SnowFlake ID generator for matches
	- 12 bits for timestamp
	- 10 bits for player IDs (5 bits each)
	- 10 bits for sequence number
*/
export function createId(p1Id, p2Id) {
	const timestamp = Date.now();
	const date = timestamp & 0b111111111111;
	const playerBits = getPlayerBits(p1Id, p2Id);
	const mySequence = getSequence(timestamp);
	const id = ((date << 20) | (playerBits << 10) | mySequence) >>> 0;

	return (id);
}

let lastTimestamp = 0;
let sequence = 0;

function getSequence(timestamp) {
	if (timestamp === lastTimestamp) {
		sequence = (sequence + 1) & 0b1111111111;
		if (sequence === 0) {
			//wait for next millisecond
			while (Date.now() === timestamp) {}
			return getSequence(Date.now());
		}
	}
	else {
		sequence = 0;
		lastTimestamp = timestamp;
	}
	return (sequence);
}

function getPlayerBits(id1, id2) {
	const p1 = id1 & 0b11111;
	const p2 = id2 & 0b11111;
	const bits = (p1 << 5) | p2; //move p1 to the left by 5 bits and add p2

	return bits;
}

