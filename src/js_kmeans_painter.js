const distance = (observation_1, observation_2) => {
    const zipped = observation_1.map((o1, i) => [o1, observation_2[i]]);
    const sum = zipped.reduce((acc, [o1, o2]) => acc + Math.pow(o1 - o2, 2), 0);
    return Math.sqrt(sum);
};

class Cluster {
    constructor(centroid) {
        this.centroid = centroid;
        this.observations = [];
    }

    add_observation(observation) {
        this.observations.push(observation);
    }

    clear_observations() {
        this.observations = [];
    }

    distance(observation) {
        return distance(this.centroid, observation)
    }

    set_centroid() {
        const empty = new Array(this.centroid.length).fill(0);
        this.centroid = this.observations
            .reduce((acc, obs) => obs.map((o, i) => o + acc[i]), empty)
            .map(f => f / this.observations.length);
    }
}

class JsKmeansPainter {
    constructor(k, img_ptr, byte_count) {
        this.k = k;
        this.img_array = new Uint8Array(Module.HEAPU8.buffer, img_ptr, byte_count);
        this.centroids = [];
        this.observations = [];
        for (let i = 0; i < this.img_array.length; i += 4) {
            this.observations.push(
                [this.img_array[i], this.img_array[i + 1], this.img_array[i + 2]]);
        }
    }

    step(steps) {
        // Add randomly initialized centroids if needed.
        while (this.centroids.length < this.k) {
            const random_index = Math.floor(Math.random() * this.observations.length);
            const random_observation = this.observations[random_index];
            this.centroids.push(random_observation);
        }
        // Create clusters.
        let clusters = this.centroids.map(c => new Cluster(c));
        let step = 0;
        while (step < steps) {
            // Clear all observations in clusters.
            for (const c of clusters) {
                c.clear_observations();
            }
            // Place each observation in the cluster with the closest centroid.
            for (const o of this.observations) {
                clusters.reduce((prev, curr) => prev.distance(o) < curr.distance(o) ? prev : curr)
                    .add_observation(o);
            }
            // Recalculate the centroid for each cluster.
            for (const c of clusters) {
                c.set_centroid();
            }
            step += 1;
        }
        // Make each cluster centroid a kmeans centroid.
        this.centroids = [];
        for (const c of clusters) {
            this.centroids.push(c.centroid);
        }
        // Paint the canvas.
        this.observations.forEach((o, i) => {
            const color = this.centroids
                .reduce((prev, curr) => distance(prev, o) < distance(curr, o) ? prev : curr);
            this.img_array[(i * 4)] = color[0];
            this.img_array[(i * 4) + 1] = color[1];
            this.img_array[(i * 4) + 2] = color[2];
        });
    }
}
