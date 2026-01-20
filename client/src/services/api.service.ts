const API_URL = "http://localhost:4000";

interface ExecutionResponse {
   output: string;
   error?: string;
}

export const executeCode = async (code: string): Promise<ExecutionResponse> => {
   try {
      const response = await fetch(`${API_URL}/run`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ code }),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || `Server Error: ${response.statusText}`);
      }

      return await response.json();
   } catch (error: any) {
      return {
         output: "",
         error: error.message || "Failed to connect to the compiler server.",
      };
   }
};
