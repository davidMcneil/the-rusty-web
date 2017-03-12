/* global AsmjsModuleInitializer */
/* External JavaScript Imports */
import $ from "jquery";

export const AsmjsModule = AsmjsModuleInitializer();
export let WasmModule = false;

const wasm_path = "rust_libs/the_rusty_web_wasm.wasm";
const js_path = "rust_libs/the_rusty_web_wasm.js";

export const load_wasm_module = () => (
    new Promise((resolve, reject) => {
        fetch(wasm_path).then((response) => {
            if (response.ok) {
                window.WasmModule = {};
                return response.arrayBuffer();
            } else {
                throw "Unable to load wasm module!";
            }
        }).then((buffer) => {
            window.WasmModule.wasmBinary = buffer;
            return $.getScript(js_path);
        }).then(() => {
            WasmModule = window.WasmModule;
            resolve();
        }).catch((err) => {
            console.error(err);
            reject();
        });
    })
);

export const native_support = () => ("WebAssembly" in window);