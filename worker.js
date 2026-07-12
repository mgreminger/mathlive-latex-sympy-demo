import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs";

async function setupPyodide() {
    self.pyodide = await loadPyodide();
    
    await self.pyodide.loadPackage("micropip");
    const micropip = self.pyodide.pyimport("micropip");
    
    // Install required dependencies (SymPy's strict ANTLR version is still required)
    await micropip.install('sympy');
    await micropip.install('antlr4-python3-runtime==4.11.1');

    // Fetch the Python code from the separate file
    const response = await fetch('simplify.py');
    const pythonCode = await response.text();
    
    // Execute it to load our Python function into the environment
    await self.pyodide.runPythonAsync(pythonCode);
    
    postMessage({ type: "ready" });
}

let pyodideReadyPromise = setupPyodide();

self.onmessage = async (event) => {
    await pyodideReadyPromise;
    
    if (event.data.type === "simplify") {
        try {
            // Pass the string securely to Python via the globals dictionary
            self.pyodide.globals.set("current_latex", event.data.latex);
            
            // Call the Python function and get the JSON response
            const resultStr = await self.pyodide.runPythonAsync(`process_latex(current_latex)`);
            
            // Parse the JSON string back into a JS object and send it to main.js
            const resultData = JSON.parse(resultStr);
            postMessage({ type: "result", data: resultData });
            
        } catch (err) {
            postMessage({ type: "error", error: err.message });
        }
    }
};