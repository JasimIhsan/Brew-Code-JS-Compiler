"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorService = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class ExecutorService {
    constructor() {
        this.TIMEOUT_MS = 5000; // 5 seconds timeout
        this.MEMORY_LIMIT_MB = 128; // 128MB memory limit
    }
    execute(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileId = (0, uuid_1.v4)();
            const filePath = path_1.default.join(__dirname, `../../temp-${fileId}.js`);
            try {
                // Wrap code to handle async/await properly at top level if needed
                // But standard Node.js handles top-level await in modules or we can wrap in IIFE
                // For simplicity and compatibility, we wrap in an async IIFE
                const wrappedCode = `
        (async () => {
          try {
            ${code}
          } catch (error) {
            console.error(error);
            process.exit(1);
          }
        })();
      `;
                yield fs_1.default.promises.writeFile(filePath, wrappedCode);
                return yield this.runFile(filePath);
            }
            catch (error) {
                return { output: "", error: error.message || "Internal Server Error" };
            }
            finally {
                // Cleanup: Delete the temporary file
                if (fs_1.default.existsSync(filePath)) {
                    yield fs_1.default.promises.unlink(filePath).catch(() => { });
                }
            }
        });
    }
    runFile(filePath) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)("node", [`--max-old-space-size=${this.MEMORY_LIMIT_MB}`, filePath]);
            let output = "";
            let errorOutput = "";
            const timeout = setTimeout(() => {
                child.kill();
                resolve({
                    output,
                    error: "Error: Execution timed out (Limit: 5s)",
                });
            }, this.TIMEOUT_MS);
            child.stdout.on("data", (data) => {
                output += data.toString();
            });
            child.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });
            child.on("close", (code) => {
                clearTimeout(timeout);
                if (code !== 0) {
                    resolve({ output, error: errorOutput || `Process exited with code ${code}` });
                }
                else {
                    resolve({ output, error: errorOutput ? errorOutput : undefined });
                }
            });
            child.on("error", (err) => {
                clearTimeout(timeout);
                resolve({ output, error: `Failed to start process: ${err.message}` });
            });
        });
    }
}
exports.ExecutorService = ExecutorService;
