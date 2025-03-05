import { useState, useEffect, useRef } from "react";
import { CodeXml, Square } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { Slider, Button } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";

export default function CodeEditor() {
	const [code, setCode] = useState(`/* 
 🚀 Welcome to BrewCode!  
 ====================================================
 BrewCode is a fast and efficient JavaScript compiler 
 designed to enhance your coding experience.  
 
 📝 Write, compile, and execute with ease.  
 🎉 Happy coding! 
 ====================================================
*/ 

console.log("Brew your code 😊");
`);

	const [fsize, setFsize] = useState(18);
	const [logs, setLogs] = useState<string[]>([]);
	console.log("logs: ", logs);
	const [stopping, setStopping] = useState(false);
	const [runState, setRunState] = useState(false);
	const workerRef = useRef<Worker | null>(null);

	const createWorker = () => {
		if (workerRef.current) {
			workerRef.current.terminate();
		}

		workerRef.current = new Worker(new URL("../worker/web-worker.ts", import.meta.url));
		workerRef.current.onmessage = (event) => {
			if (event.data.type === "log") {
				console.log("event.data: ", event.data);

				setLogs((prev) => [...prev, event.data.message]);
			}
			if (event.data.type === "done") {
				setLogs((prev) => [...prev, event.data.message]);
				setRunState(false);
				workerRef.current?.terminate();
				workerRef.current = null;
			}
		};
	};

	const clearCode = () => {
		setCode("");
	};

	useEffect(() => {
		createWorker();
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);

	const handleRunCode = () => {
		setRunState(true);
		setLogs([]);
		if (!workerRef.current) createWorker();
		workerRef.current?.postMessage(code);
	};

	const handleStopCode = () => {
		if (workerRef.current) {
			setStopping(true);
			workerRef.current.postMessage({ type: "stop" });

			setTimeout(() => {
				workerRef.current?.terminate();
				workerRef.current = null;
				setRunState(false);
				setStopping(false);
				createWorker();
			}, 500);
		}
	};

	return (
		<div className="flex flex-1 flex-col md:flex-row bg-gray-800">
			<div className="flex flex-1 flex-col border-r border-gray-700">
				<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
					<div className="text-m text-gray-400">main.js</div>
					<div className="flex items-center gap-5 w-110">
						<button className="text-m text-gray-400 hover:text-gray-300 px-7 py-1 rounded" onClick={clearCode}>
							Clear
						</button>
						<TextFieldsIcon color="primary" onClick={() => setFsize(18)} />
						<Slider defaultValue={18} value={fsize} valueLabelDisplay="auto" step={2} marks min={10} max={30} onChange={(_, newValue) => setFsize(newValue as number)} />
						{!runState ? (
							<button className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700 flex gap-1" onClick={handleRunCode}>
								<CodeXml /> Run
							</button>
						) : (
							<Button onClick={handleStopCode} loading={stopping} loadingIndicator="Loading…" variant="outlined">
								<Square size={18} /> Stop
							</Button>
						)}
					</div>
				</div>
				<Editor theme="vs-dark" options={{ fontSize: fsize, quickSuggestions: true, suggestOnTriggerCharacters: true }} defaultLanguage="javascript" value={code} onChange={(value) => setCode(value || "")} />
			</div>
			<div className="flex h-64 flex-col md:h-auto md:w-1/2">
				<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
					<div className="text-m text-gray-400">Output</div>
					<div className="flex items-center">
						<button className="text-m text-gray-400 hover:text-gray-300  px-7 py-1 rounded" onClick={() => navigator.clipboard.writeText(logs.join("\n"))}>
							copy
						</button>
						<button className="text-m text-gray-400 hover:text-gray-300 border-1 px-7 py-1 rounded" onClick={() => setLogs([])}>
							Clear
						</button>
					</div>
				</div>

				<div className="px-4 py-2 h-screen overflow-y-auto bg-black text-white font-mono text-m">
					{logs.map((log, index) => {
						return <div key={index}>{log}</div>;
					})}
				</div>
			</div>
		</div>
	);
}
