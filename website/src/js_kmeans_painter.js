/* global Module */
import { Kmeans } from "./kmeans";

export class JsKmeansPainter {
    constructor(k, img_ptr, byte_count) {
        this.img_data = new Uint8Array(Module.HEAPU8.buffer, img_ptr, byte_count);
        this.observations = [];
        // Convert each pixel into an observation consisting of a red, blue, and green component.
        for (let i = 0; i < this.img_data.length; i += 4) {
            this.observations.push(
                [this.img_data[i], this.img_data[i + 1], this.img_data[i + 2]]
            );
        }
        this.kmeans = new Kmeans(k);
    }

    step(steps) {
        this.kmeans.train(this.observations, steps);
        // Color each pixel based on the predicted color.
        this.observations.forEach((o, i) => {
            const color = this.kmeans.predict(o);
            this.img_data[(i * 4)] = color[0];
            this.img_data[(i * 4) + 1] = color[1];
            this.img_data[(i * 4) + 2] = color[2];
        });
    }
}
