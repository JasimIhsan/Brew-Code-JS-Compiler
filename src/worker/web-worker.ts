const LOG_LIMIT = 2000;

let shouldStop = false;
let logs: string[] = [];

self.onmessage = function (event) {
	const code = event.data;

	if (code.type === "stop") {
		shouldStop = true;
		return;
	}

	function format(arg: any): string {
		if (arg === null) return "null";
		if (arg === undefined) return "undefined";
		if (typeof arg === "string") return arg; // Preserve formatting, no escaping
		if (typeof arg === "bigint") return `${arg}n`;
		if (typeof arg === "function") return `[Function: ${arg.name || "anonymous"}]`;
		if (arg instanceof RegExp) return arg.toString();
		if (arg instanceof Date) return `Date { "${arg.toISOString()}" }`;
		if (arg instanceof Error) return `${arg.stack}`;

		if (arg instanceof Set) {
			return `Set { ${Array.from(arg).map(format).join(", ")} }`;
		}

		if (arg instanceof Map) {
			return `Map { ${Array.from(arg.entries())
				.map(([k, v]) => `${format(k)} => ${format(v)}`)
				.join(", ")} }`;
		}

		if (ArrayBuffer.isView(arg)) {
			return `${arg.constructor.name} [ ${Array.prototype.slice.call(arg).join(", ")} ]`;
		}

		if (typeof arg === "object") {
			try {
				return JSON.stringify(arg, null, 2); // Pretty-print objects
			} catch {
				return "[Circular]";
			}
		}

		return String(arg);
	}

	function captureLog(type: "log" | "warn" | "error", ...args: any[]) {
		if (logs.length >= LOG_LIMIT) {
			self.postMessage({ type: "done", message: "=== Log limit exceeded! ===" });
			return;
		}

		const formatted = args.map(format).join(" ");
		logs.push(formatted);

		self.postMessage({ type: "log", level: type, message: formatted });
	}

	// Override console methods
	self.console = {
		...self.console,
		log: (...args: any[]) => captureLog("log", ...args),
		warn: (...args: any[]) => captureLog("warn", "[Warn]", ...args),
		error: (...args: any[]) => captureLog("error", "[Error]", ...args),
	};

	try {
		const wrappedCode = `(function(){${code}})()`;
		eval(wrappedCode);
		self.postMessage({ type: "done", message: "\n=== Execution Completed ===" });
	} catch (err: any) {
		const cleanStack = err.stack
			.split("\n")
			.filter((line: any) => !line.includes("self.onmessage") && !line.includes("worker_file"))
			.join("\n");
		self.postMessage({ type: "log", level: "error", message: cleanStack || `Error: ${err.message}` });
	}
};

// Stop Execution Logic
function checkStopSignal() {
	if (shouldStop) {
		self.postMessage({ type: "done", message: "=== Execution stopped by user ===" });
	}
	setTimeout(checkStopSignal, 100);
}
checkStopSignal();
