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

class Histogram {
	constructor({ name, help, buckets }) {
		this.name = name;
		this.help = help;
		this.type = "histogram";
		this.buckets = buckets.slice().sort((a, b) => a - b);
		this.series = new Map(); // key -> { labels, bucketCounts, sum, count }
	}

	observe(labels = {}, value) {
		const key = stableLabelKey(labels);
		let entry = this.series.get(key);
		if (!entry) {
			entry = {
				labels,
				bucketCounts: new Array(this.buckets.length + 1).fill(0),
				sum: 0,
				count: 0
			};
			this.series.set(key, entry);
		}
		entry.sum += value;
		entry.count += 1;

		let idx = this.buckets.findIndex((b) => value <= b);
		if (idx === -1) idx = this.buckets.length; // +Inf
		entry.bucketCounts[idx] += 1;
	}

	renderLines() {
		const lines = [];
		lines.push(`# HELP ${this.name} ${this.help}`);
		lines.push(`# TYPE ${this.name} ${this.type}`);

		for (const { labels, bucketCounts, sum, count } of this.series.values()) {
			let cumulative = 0;
			for (let i = 0; i < this.buckets.length; i++) {
				cumulative += bucketCounts[i];
				lines.push(
					`${this.name}_bucket${formatLabels({ ...labels, le: String(this.buckets[i]) })} ${cumulative}`
				);
			}
			cumulative += bucketCounts[this.buckets.length];
			lines.push(`${this.name}_bucket${formatLabels({ ...labels, le: "+Inf" })} ${cumulative}`);
			lines.push(`${this.name}_sum${formatLabels(labels)} ${sum}`);
			lines.push(`${this.name}_count${formatLabels(labels)} ${count}`);
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

	const httpRequestsTotal = new Counter({
		name: "http_requests_total",
		help: "Total HTTP requests"
	});

	const httpRequestsInFlight = new Gauge({
		name: "http_requests_in_flight",
		help: "HTTP requests currently being processed"
	});

	const httpRequestDurationSeconds = new Histogram({
		name: "http_request_duration_seconds",
		help: "HTTP request duration in seconds",
		buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
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
			...httpRequestsInFlight.renderLines(),
			...httpRequestsTotal.renderLines(),
			...httpRequestDurationSeconds.renderLines()
		].join("\n") + "\n";
	}

	return {
		contentType: CONTENT_TYPE,
		defaultLabels,
		httpRequestsTotal,
		httpRequestsInFlight,
		httpRequestDurationSeconds,
		render
	};
}

export function registerFastifyMetrics(app, { serviceName }) {
	const registry = createRegistry({ serviceName });

	app.get("/metrics", async (_req, reply) => {
		reply.header("content-type", registry.contentType);
		return registry.render();
	});

	app.addHook("onRequest", async (request) => {
		if (request.raw?.url?.startsWith("/metrics")) return;
		registry.httpRequestsInFlight.inc(registry.defaultLabels, 1);
		request.__metricsStartNs = process.hrtime.bigint();
	});

	app.addHook("onResponse", async (request, reply) => {
		if (request.raw?.url?.startsWith("/metrics")) return;

		registry.httpRequestsInFlight.dec(registry.defaultLabels, 1);

		const start = request.__metricsStartNs;
		if (typeof start === "bigint") {
			const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
			const route =
				request.routeOptions?.url ||
				request.routerPath ||
				(reply.statusCode === 404 ? "not_found" : "unknown");

			const labels = {
				...registry.defaultLabels,
				method: request.method,
				route,
				status_code: String(reply.statusCode)
			};

			registry.httpRequestsTotal.inc(labels, 1);
			registry.httpRequestDurationSeconds.observe(labels, durationSeconds);
		}
	});

	return registry;
}

