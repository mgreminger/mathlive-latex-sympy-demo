// ADDED: { type: 'module' } is now required for Pyodide > 0.26 / 314.x
const worker = new Worker('worker.js', { type: 'module' });

const statusBox = document.getElementById('status-box');
const mfInput = document.getElementById('math-input');
const mfOutput = document.getElementById('math-output');

// Output Containers
const outRawLatex = document.getElementById('out-raw-latex');
const outRawSympy = document.getElementById('out-raw-sympy');
const outRawSimpSympy = document.getElementById('out-raw-simp-sympy');
const outFinalLatex = document.getElementById('out-final-latex');

// Handle messages from the Web Worker
worker.onmessage = function(event) {
    const msg = event.data;
    
    if (msg.type === 'ready') {
        statusBox.textContent = 'Status: Ready! Editing the MathLive field triggers live updates.';
        triggerUpdate(); // Run the initial equation on load
    } 
    else if (msg.type === 'result') {
        const res = msg.data;
        
        if (res.success) {
            statusBox.textContent = 'Status: Ready!';
            
            // Populate the intermediate steps
            outRawLatex.textContent = res.raw_latex;
            outRawSympy.textContent = res.raw_sympy;
            outRawSimpSympy.textContent = res.raw_simplified_sympy;
            outFinalLatex.textContent = res.final_latex;
            
            // Set the final rendered output
            mfOutput.value = res.final_latex;
        } else {
            statusBox.innerHTML = `<span class="error">Python Error: ${res.error}</span>`;
        }
    } 
    else if (msg.type === 'error') {
        statusBox.innerHTML = `<span class="error">Worker Error: ${msg.error}</span>`;
    }
};

// Send the current input to the worker
function triggerUpdate() {
    statusBox.textContent = 'Status: Simplifying...';
    worker.postMessage({ type: 'simplify', latex: mfInput.value });
}

// Debounce logic: wait until the user stops typing for 600ms before sending
let debounceTimer;
mfInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(triggerUpdate, 600);
});