import { WasmModule } from "./modules";

let loaded = false;
let create = () => { };
let step = () => { };
let destroy = () => { };

const load_wasm_exports = () => {
    loaded = true;
    create = WasmModule.cwrap("kmeans_painter_create", "number", ["number", "number", "number"]);
    step = WasmModule.cwrap("kmeans_painter_step", null, ["number", "number"]);
    destroy = WasmModule.cwrap("kmeans_painter_destroy", null, ["number"]);
};

export class WasmKmeansPainter {
    constructor(k, image_memory) {
        if (!loaded) { load_wasm_exports(); }
        this.k = k;
        this.ptr = create(this.k, image_memory.get_ptr(), image_memory.get_byte_count());
    }

    get_identifier() { return "Rust (wasm)"; }

    get_k() { return this.k; }

    step(steps) {
        step(this.ptr, steps);
    }

    free() {
        destroy(this.ptr);
    }
}
