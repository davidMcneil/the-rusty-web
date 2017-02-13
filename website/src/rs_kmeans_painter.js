/* global Module */
const create = Module.cwrap("kmeans_painter_create", "number", ["number", "number", "number"]);
const step = Module.cwrap("kmeans_painter_step", null, ["number", "number"]);
const destroy = Module.cwrap("kmeans_painter_destroy", null, ["number"]);

export class RsKmeansPainter {
    constructor(k, image_memory) {
        this.ptr = create(k, image_memory.get_ptr(), image_memory.get_byte_count());
    }

    step(steps) {
        step(this.ptr, steps);
    }

    free() {
        destroy(this.ptr);
    }
}
