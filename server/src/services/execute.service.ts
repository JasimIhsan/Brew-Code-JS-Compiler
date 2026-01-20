import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface ExecutionResult {
   output: string;
   error?: string;
}

export class ExecutorService {
   private readonly TIMEOUT_MS = 5000; // 5 seconds timeout
   private readonly MEMORY_LIMIT_MB = 128; // 128MB memory limit
   private readonly MAX_OUTPUT_SIZE = 1 * 1024 * 1024; // 1MB output limit

   public async execute(code: string): Promise<ExecutionResult> {
      const fileId = uuidv4();
      const filePath = path.join(__dirname, `../../temp-${fileId}.js`);

      try {
         // Wrap code to handle async/await properly at top level if needed
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

         await fs.promises.writeFile(filePath, wrappedCode);

         return await this.runFile(filePath);
      } catch (error: any) {
         return { output: "", error: error.message || "Internal Server Error" };
      } finally {
         // Cleanup: Delete the temporary file
         if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath).catch(() => {});
         }
      }
   }

   private runFile(filePath: string): Promise<ExecutionResult> {
      return new Promise((resolve) => {
         const child = spawn("node", [`--max-old-space-size=${this.MEMORY_LIMIT_MB}`, filePath]);

         let output = "";
         let errorOutput = "";
         let outputLimitReached = false;

         const timeout = setTimeout(() => {
            child.kill();
            resolve({
               output,
               error: "Error: Execution timed out (Limit: 5s)",
            });
         }, this.TIMEOUT_MS);

         child.stdout.on("data", (data) => {
            if (outputLimitReached) return;

            output += data.toString();

            if (output.length > this.MAX_OUTPUT_SIZE) {
               output = output.substring(0, this.MAX_OUTPUT_SIZE) + "\n... [Output truncated due to size limit]";
               outputLimitReached = true;
               child.kill(); // Kill the process as it's producing too much data
            }
         });

         child.stderr.on("data", (data) => {
            if (outputLimitReached) return;
            errorOutput += data.toString();
         });

         child.on("close", (code) => {
            clearTimeout(timeout);

            if (outputLimitReached) {
               resolve({ output, error: "Error: Output limit exceeded (1MB)" });
               return;
            }

            if (code !== 0) {
               resolve({ output, error: errorOutput || `Process exited with code ${code}` });
            } else {
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
