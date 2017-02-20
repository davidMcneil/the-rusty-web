import { AsmjsModule } from "./modules";

const create = AsmjsModule.cwrap("kmeans_painter_create", "number", ["number", "number", "number"]);
const step = AsmjsModule.cwrap("kmeans_painter_step", null, ["number", "number"]);
const destroy = AsmjsModule.cwrap("kmeans_painter_destroy", null, ["number"]);

export class AsmjsKmeansPainter {
    constructor(k, image_memory) {
        this.k = k;
        this.ptr = create(this.k, image_memory.get_ptr(), image_memory.get_byte_count());
    }

    get_identifier() { return "Rust (asmjs)"; }

    get_k() { return this.k; }

    step(steps) {
        step(this.ptr, steps);
    }

    free() {
        destroy(this.ptr);
    }
}
