const rs_new = Module.cwrap("kmeans_painter_new", "number", ["number", "number", "number"]);
const rs_step = Module.cwrap("kmeans_painter_step", null, ["number", "number"]);
const rs_free = Module.cwrap("kmeans_painter_free", null, ["number"]);

class RsKmeansPainter {
    constructor(k, img_ptr, byte_count) {
        this.ptr = rs_new(k, img_ptr, byte_count);
    }

    step(steps) {
        rs_step(this.ptr, steps);
    }

    free() {
        rs_free(this.ptr);
    }
}
