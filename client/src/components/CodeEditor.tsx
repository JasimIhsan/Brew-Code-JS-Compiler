import { Editor } from "@monaco-editor/react";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { ListItemIcon, Slider } from "@mui/material";
import { CodeXml, Loader2, PanelRightClose, PanelRightOpen, Text } from "lucide-react";
import * as monaco from "monaco-editor";
import { useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import { SettingsApplications } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Menu, MenuItem } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "../context/ThemeContext";
import { executeCode } from "../services/api.service";

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

(async () => {
  console.log("Brew your code 😊");
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Async works too! ⚡");
})();
`);

   const [fsize, setFsize] = useState(18);
   const [logs, setLogs] = useState<string[]>([]);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null);
   const [isRunning, setIsRunning] = useState(false);
   const [autoSuggestion, setAutoSuggestion] = useState(true);
   const [showConsole, setShowConsole] = useState(true);
   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
   const { theme } = useTheme();

   const clearCode = () => {
      setCode("");
   };

   const handleRunCode = async (codeToRun: string) => {
      if (isRunning) return;

      setIsRunning(true);
      setLogs([]);
      setShowConsole(true);

      try {
         const result = await executeCode(codeToRun);

         if (result.output) {
            // Split output by lines to display logically
            const outputLines = result.output.split("\n").filter((line) => line.length > 0);
            setLogs((prev) => [...prev, ...outputLines]);
         }

         if (result.error) {
            setLogs((prev) => [...prev, `❌ Error:\n${result.error}`]);
            setLogs((prev) => [...prev, "\n=== Code Execution Failed ==="]);
         } else {
            setLogs((prev) => [...prev, "\n=== Code Execution Successful ==="]);
         }

         if (!result.output && !result.error) {
            setLogs((prev) => [...prev, "Program finished with no output."]);
         }
      } catch (e) {
         setLogs((prev) => [...prev, "❌ Failed to execute code."]);
         setLogs((prev) => [...prev, "\n=== Code Execution Crashed ==="]);
      } finally {
         setIsRunning(false);
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
         {/* changed the theme here */}
         <div className={`flex flex-1 flex-col md:flex-row  ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <Panel minSize={30}>
               <div className={`flex flex-1 flex-col border-r  ${theme === "dark" ? " border-gray-700" : " border-gray-200"}`}>
                  <div className={`flex items-center justify-between border-b ${theme === "dark" ? " border-gray-700" : " border-gray-200"} px-4 py-2.5`}>
                     <div className={`${theme === "dark" ? "text-gray-400" : "text-gray-800"} text-m`}>main.js</div>
                     <div className="flex items-center justify-end gap-5 w-110">
                        <button className={`text-m py-1 rounded  ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-800 hover:text-gray-900"}`} onClick={clearCode}>
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
                           }}
                        >
                           <MenuItem>
                              <ListItemIcon onClick={() => setFsize(18)}>
                                 <TextFieldsIcon color="primary" titleAccess="Default: 18" />
                              </ListItemIcon>
                              <Box sx={{ width: "200px", paddingX: 2 }}>
                                 <Slider defaultValue={18} value={fsize} valueLabelDisplay="auto" step={2} marks min={10} max={30} onChange={(_, newValue) => setFsize(newValue as number)} componentsProps={{ valueLabel: { style: { top: 22, transform: "translateY(100%)" } } }} />
                              </Box>
                           </MenuItem>
                           <MenuItem>
                              <div className="flex gap-19 items-center">
                                 <ListItemIcon>Auto Suggestion</ListItemIcon>
                                 <Checkbox checked={autoSuggestion} onChange={handleAutoSuggetion} />
                              </div>
                           </MenuItem>
                        </Menu>

                        <button className={`rounded px-4 py-1 text-white flex gap-1 items-center ${isRunning ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`} onClick={() => handleRunCode(code)} disabled={isRunning} title="Ctrl + '">
                           {isRunning ? <Loader2 className="animate-spin" size={18} /> : <CodeXml size={18} />}
                           {isRunning ? "Running..." : "Run"}
                        </button>
                     </div>
                  </div>
                  <Editor
                     className="h-screen"
                     theme={theme === "dark" ? "vs-dark" : "vs-light"}
                     options={{
                        fontSize: fsize,
                        quickSuggestions: autoSuggestion,
                        suggestOnTriggerCharacters: autoSuggestion,
                        wordBasedSuggestions: autoSuggestion ? "currentDocument" : "off",
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
                     <div className={`flex items-center justify-between border-b ${theme === "dark" ? " border-gray-700" : " border-gray-200"} px-4 py-2.5`}>
                        <div className={theme === "dark" ? "text-gray-400" : "text-gray-800"}>Output</div>
                        <div className="flex items-center">
                           <button className={`px-7 cursor-pointer py-1 rounded ${theme === "dark" ? "text-gray-400 hover:text-gray-300 bg-gray-800" : "text-gray-800 hover:text-gray-600 bg-white"}`} onClick={() => navigator.clipboard.writeText(logs.join("\n"))}>
                              copy
                           </button>
                           <button className={`border px-7 cursor-pointer py-1 rounded ${theme === "dark" ? "text-gray-400 hover:text-gray-300 border-gray-500 bg-gray-800" : "text-gray-700 hover:text-gray-600 border-gray-500 bg-white"}`} onClick={() => setLogs([])}>
                              Clear
                           </button>
                           <PanelRightClose className={`ml-4 hover:cursor-pointer ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-800 hover:text-gray-600"}`} onClick={() => setShowConsole(!showConsole)} />
                        </div>
                     </div>

                     <div className={`px-4 py-2 h-screen overflow-y-auto font-mono text-m whitespace-pre-wrap ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
                        {logs.map((log, index) => {
                           return <div key={index}>{log}</div>;
                        })}
                     </div>
                  </div>
               </Panel>
            )}

            {!showConsole && (
               <div className="w-10 h-screen flex items-center justify-start mt-3.5 flex-col relative space-y-2">
                  <PanelRightOpen className={`mb-6 ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-800 hover:text-gray-600"}`} onClick={() => setShowConsole(!showConsole)} />
                  <p className={`text-center -rotate-90 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-800"}`}>Console</p>
               </div>
            )}
         </div>
      </PanelGroup>
   );
}
