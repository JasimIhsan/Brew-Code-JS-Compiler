import { useState, useEffect, useRef } from "react";
import { CodeXml, Square, PanelRightClose, Text, PanelRightOpen } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ListItemIcon, Slider } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import { SettingsApplications } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import { Menu, MenuItem, Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

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
	const [, setStopping] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null);
	const [runState, setRunState] = useState(false);
	const [autoSuggestion, setAutoSuggestion] = useState(true);
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

	const handleRunCode = (code: string) => {
		setRunState(true);
		setLogs([]);
		console.log(code);
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

		editorRef.current?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => {
			const currentCode = editorRef.current?.getValue() ?? "";
			handleRunCode(currentCode);
		});
	};

	const handleSettingsClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleAutoSuggetion = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAutoSuggestion(event?.target.checked);
	};

	return (
		<PanelGroup direction="horizontal">
			<div className="flex flex-1 flex-col md:flex-row bg-gray-800">
				<Panel minSize={30}>
					<div className="flex flex-1 flex-col border-r border-gray-700">
						<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5">
							<div className="text-m text-gray-400">main.js</div>
							<div className="flex items-center justify-end gap-5 w-110">
								<button className="text-m text-gray-400 hover:text-gray-300  py-1 rounded" onClick={clearCode}>
									Clear
								</button>
								<button className="hover:cursor-pointer hover:bg-gray-700 rounded  p-1" onClick={handleFormateEditor}>
									<Text color="gray" />
								</button>
								{/* Settings Button */}
								<SettingsIcon className="hover:cursor-pointer text-gray-400 hover:text-gray-300" onClick={(event: React.MouseEvent<SVGSVGElement>) => handleSettingsClick(event)} />
								<Menu
									className="w-3xl"
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={handleClose}
									anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
									transformOrigin={{
										vertical: "top",
										horizontal: "right",
									}}>
									<MenuItem>
										<ListItemIcon onClick={() => setFsize(18)}>
											<TextFieldsIcon color="primary" titleAccess="Default: 18" />
										</ListItemIcon>
										<Box sx={{ width: "200px", paddingX: 2 }}>
											<Slider
												defaultValue={18}
												value={fsize}
												valueLabelDisplay="auto"
												step={2}
												marks
												min={10}
												max={30}
												onChange={(_, newValue) => setFsize(newValue as number)}
												componentsProps={{ valueLabel: { style: { top: 22, transform: "translateY(100%)" } } }}
											/>
										</Box>
									</MenuItem>
									<MenuItem>
										<div className="flex gap-19 items-center">
											<ListItemIcon>Auto Suggestion</ListItemIcon>
											<Checkbox checked={autoSuggestion} onChange={handleAutoSuggetion} />
										</div>
									</MenuItem>
								</Menu>
								{!runState ? (
									<button className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700 flex gap-1" onClick={() => handleRunCode(code)} title="Ctrl + '">
										<CodeXml /> Run
									</button>
								) : (
									<button onClick={handleStopCode} className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700 flex gap-1 items-center">
										<Square size={18} /> Stop
									</button>
								)}
							</div>
						</div>
						<Editor
							className="h-screen"
							theme="vs-dark"
							options={{
								fontSize: fsize,
								quickSuggestions: autoSuggestion,
								suggestOnTriggerCharacters: autoSuggestion,
								wordBasedSuggestions: autoSuggestion ? "currentDocument" : "off",
								// inlineSuggest: ,
								snippetSuggestions: autoSuggestion ? "inline" : "none",
							}}
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
