import { Kmeans } from "./kmeans";

export class JsKmeansPainter {
    constructor(k, image_memory) {
        this.image_array = image_memory.get_image_array();
        this.observations = [];
        // Convert each pixel into an observation consisting of a red, blue, and green component.
        for (let i = 0; i < this.image_array.length; i += 4) {
            this.observations.push(
                [this.image_array[i], this.image_array[i + 1], this.image_array[i + 2]]
            );
        }
        this.kmeans = new Kmeans(k);
    }

    step(steps) {
        this.kmeans.train(this.observations, steps);
        // Color each pixel based on the predicted color.
        this.observations.forEach((o, i) => {
            const color = this.kmeans.predict(o);
            this.image_array[(i * 4)] = color[0];
            this.image_array[(i * 4) + 1] = color[1];
            this.image_array[(i * 4) + 2] = color[2];
        });
    }
}
