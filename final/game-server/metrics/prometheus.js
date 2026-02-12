const CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";

function escapeLabelValue(value) {
	return String(value)
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/"/g, '\\"');
}

function stableLabelKey(labels) {
	const keys = Object.keys(labels).sort();
	return keys.map((k) => `${k}=${labels[k]}`).join("\u0001");
}

function formatLabels(labels) {
	const keys = Object.keys(labels);
	if (!keys.length) return "";
	keys.sort();
	const parts = keys.map((k) => `${k}="${escapeLabelValue(labels[k])}"`);
	return `{${parts.join(",")}}`;
}

class Counter {
	constructor({ name, help }) {
		this.name = name;
		this.help = help;
		this.type = "counter";
		this.series = new Map(); // key -> { labels, value }
	}

	inc(labels = {}, value = 1) {
		const key = stableLabelKey(labels);
		const prev = this.series.get(key);
		if (prev) {
			prev.value += value;
			return;
		}
		this.series.set(key, { labels, value });
	}

	set(labels = {}, value = 0) {
		const key = stableLabelKey(labels);
		const prev = this.series.get(key);
		if (prev) {
			prev.value = value;
			return;
		}
		this.series.set(key, { labels, value });
	}

	renderLines() {
		const lines = [];
		lines.push(`# HELP ${this.name} ${this.help}`);
		lines.push(`# TYPE ${this.name} ${this.type}`);
		for (const { labels, value } of this.series.values()) {
			lines.push(`${this.name}${formatLabels(labels)} ${value}`);
		}
		return lines;
	}
}

class Gauge {
	constructor({ name, help }) {
		this.name = name;
		this.help = help;
		this.type = "gauge";
		this.series = new Map(); // key -> { labels, value }
	}

	set(labels = {}, value) {
		const key = stableLabelKey(labels);
		const prev = this.series.get(key);
		if (prev) {
			prev.value = value;
			return;
		}
		this.series.set(key, { labels, value });
	}

	inc(labels = {}, value = 1) {
		const key = stableLabelKey(labels);
		const prev = this.series.get(key);
		if (prev) {
			prev.value += value;
			return;
		}
		this.series.set(key, { labels, value });
	}

	dec(labels = {}, value = 1) {
		this.inc(labels, -value);
	}

	renderLines() {
		const lines = [];
		lines.push(`# HELP ${this.name} ${this.help}`);
		lines.push(`# TYPE ${this.name} ${this.type}`);
		for (const { labels, value } of this.series.values()) {
			lines.push(`${this.name}${formatLabels(labels)} ${value}`);
		}
		return lines;
	}
}

function createRegistry({ serviceName }) {
	const defaultLabels = { service: serviceName };

	const nodejsVersionInfo = new Gauge({
		name: "nodejs_version_info",
		help: "Node.js version"
	});
	nodejsVersionInfo.set({ ...defaultLabels, version: process.version }, 1);

	const processUptimeSeconds = new Gauge({
		name: "process_uptime_seconds",
		help: "Process uptime in seconds"
	});
	const processResidentMemoryBytes = new Gauge({
		name: "process_resident_memory_bytes",
		help: "Resident memory size in bytes"
	});
	const processHeapUsedBytes = new Gauge({
		name: "process_heap_used_bytes",
		help: "Process heap used in bytes"
	});
	const processHeapTotalBytes = new Gauge({
		name: "process_heap_total_bytes",
		help: "Process heap total in bytes"
	});
	const processCpuUserSecondsTotal = new Counter({
		name: "process_cpu_user_seconds_total",
		help: "Total user CPU time spent in seconds"
	});
	const processCpuSystemSecondsTotal = new Counter({
		name: "process_cpu_system_seconds_total",
		help: "Total system CPU time spent in seconds"
	});

	const wsConnections = new Gauge({
		name: "ws_connections",
		help: "Current active WebSocket connections"
	});
	wsConnections.set(defaultLabels, 0);

	const wsMessagesReceivedTotal = new Counter({
		name: "ws_messages_received_total",
		help: "Total WebSocket messages received"
	});

	function collectProcessMetrics() {
		const mem = process.memoryUsage();
		processUptimeSeconds.set(defaultLabels, process.uptime());
		processResidentMemoryBytes.set(defaultLabels, mem.rss);
		processHeapUsedBytes.set(defaultLabels, mem.heapUsed);
		processHeapTotalBytes.set(defaultLabels, mem.heapTotal);

		const cpu = process.cpuUsage();
		processCpuUserSecondsTotal.set(defaultLabels, cpu.user / 1e6);
		processCpuSystemSecondsTotal.set(defaultLabels, cpu.system / 1e6);
	}

	function render() {
		collectProcessMetrics();
		return [
			...nodejsVersionInfo.renderLines(),
			...processUptimeSeconds.renderLines(),
			...processResidentMemoryBytes.renderLines(),
			...processHeapUsedBytes.renderLines(),
			...processHeapTotalBytes.renderLines(),
			...processCpuUserSecondsTotal.renderLines(),
			...processCpuSystemSecondsTotal.renderLines(),
			...wsConnections.renderLines(),
			...wsMessagesReceivedTotal.renderLines()
		].join("\n") + "\n";
	}

	return {
		contentType: CONTENT_TYPE,
		defaultLabels,
		wsConnections,
		wsMessagesReceivedTotal,
		render
	};
}

export function createGameServerMetrics({ serviceName }) {
	return createRegistry({ serviceName });
}

