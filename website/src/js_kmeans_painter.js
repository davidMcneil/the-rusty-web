import { Kmeans } from "./kmeans";

const BYTES_PER_PIXEL = 4;

export class JsKmeansPainter {
    constructor(k, image_memory) {
        this.k = k;
        this.image_array = image_memory.get_image_array();
        this.observations = [];
        // Convert each pixel into an observation consisting of a red, blue, and green component.
        for (let i = 0; i < this.image_array.length; i += BYTES_PER_PIXEL) {
            this.observations.push(
                [this.image_array[i], this.image_array[i + 1], this.image_array[i + 2]]
            );
        }
        this.kmeans = new Kmeans(this.k);
    }

    get_identifier() { return "JavaScript"; }

    get_k() { return this.k; }

    step(steps) {
        this.kmeans.train(this.observations, steps);
        // Color each pixel based on the predicted color.
        this.observations.forEach((o, i) => {
            const color = this.kmeans.predict(o);
            this.image_array[(i * BYTES_PER_PIXEL)] = color[0];
            this.image_array[(i * BYTES_PER_PIXEL) + 1] = color[1];
            this.image_array[(i * BYTES_PER_PIXEL) + 2] = color[2];
        });
    }

    free() { }
}
