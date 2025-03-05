import { useState, useEffect, useRef } from "react";
import { CodeXml, Square, PanelRightClose, Text, PanelRightOpen } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Slider, Button } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
	const [showConsole, setShowConsole] = useState(true);
	const workerRef = useRef<Worker | null>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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

	const handleFormateEditor = () => {
		if (editorRef.current) {
			editorRef.current.getAction("editor.action.formatDocument")?.run();
		}
	};

	const handleEditorDidMount = (editor: any) => {
		editorRef.current = editor;
	};

	return (
		<PanelGroup direction="horizontal">
			<div className="flex flex-1 flex-col md:flex-row bg-gray-800">
				<Panel minSize={30}>
					<div className="flex flex-1 flex-col border-r border-gray-700">
						<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
							<div className="text-m text-gray-400">main.js</div>
							<div className="flex items-center gap-5 w-110">
								<button className="hover:cursor-pointer hover:bg-gray-700 rounded  p-1" onClick={handleFormateEditor}>
									<Text color="gray" />
								</button>
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
						<Editor
							className="h-screen"
							theme="vs-dark"
							options={{ fontSize: fsize, quickSuggestions: true, suggestOnTriggerCharacters: true }}
							defaultLanguage="javascript"
							value={code}
							onChange={(value) => setCode(value || "")}
							onMount={handleEditorDidMount}
						/>
					</div>
				</Panel>

				<PanelResizeHandle />

				{showConsole && (
					<Panel minSize={20}>
						<div className="flex flex-col">
							<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
								<div className="text-m text-gray-400">Output</div>
								<div className="flex items-center">
									<button className="text-m text-gray-400 hover:text-gray-300  px-7 py-1 rounded" onClick={() => navigator.clipboard.writeText(logs.join("\n"))}>
										copy
									</button>
									<button className="text-m text-gray-400 hover:text-gray-300 border-1 px-7 py-1 rounded" onClick={() => setLogs([])}>
										Clear
									</button>
									<PanelRightClose className="ml-4 text-gray-400 hover:text-gray-300 hover:cursor-pointer" onClick={() => setShowConsole(!showConsole)} />
								</div>
							</div>

							<div className="px-4 py-2 h-screen overflow-y-auto bg-black text-white font-mono text-m">
								{logs.map((log, index) => {
									return <div key={index}>{log}</div>;
								})}
							</div>
						</div>
					</Panel>
				)}

				{!showConsole && (
					<div className="w-10 h-screen flex items-center justify-start mt-3.5 flex-col relative space-y-2">
						<PanelRightOpen className="mb-6 text-gray-400 hover:text-gray-300" onClick={() => setShowConsole(!showConsole)} />
						<p className="text-center  -rotate-90 text-sm text-gray-400">Console</p>
					</div>
				)}
			</div>
		</PanelGroup>
	);
}
