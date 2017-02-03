const create = Module.cwrap("kmeans_painter_create", "number", ["number", "number", "number"]);
const step = Module.cwrap("kmeans_painter_step", null, ["number", "number"]);
const destroy = Module.cwrap("kmeans_painter_destroy", null, ["number"]);

class RsKmeansPainter {
    constructor(k, img_ptr, byte_count) {
        this.ptr = create(k, img_ptr, byte_count);
    }

    step(steps) {
        step(this.ptr, steps);
    }

    free() {
        destroy(this.ptr);
    }
}
