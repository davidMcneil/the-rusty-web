const distance = (observation_1, observation_2) => {
    let sum_sqrs = 0;
    for (let i = 0; i < observation_1.length; i++) {
        sum_sqrs += Math.pow(observation_1[i] - observation_2[i], 2);
    }
    return Math.sqrt(sum_sqrs);
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
        return distance(this.centroid, observation);
    }

    set_centroid() {
        const empty = new Array(this.centroid.length).fill(0);
        this.centroid = this.observations
            .reduce((acc, obs) => obs.map((o, i) => o + acc[i]), empty)
            .map(f => f / this.observations.length);
    }
}

export class Kmeans {
    constructor(k) {
        this.k = k;
        this.centroids = [];
    }

    train(observations, steps) {
        // If needed add randomly initialized centroids.
        while (this.centroids.length < this.k) {
            const random_index = Math.floor(Math.random() * observations.length);
            const random_observation = observations[random_index];
            this.centroids.push(random_observation);
        }
        // Create clusters from the centroids.
        let clusters = this.centroids.map(c => new Cluster(c));
        let step = 0;
        while (step < steps) {
            // Clear all the observations from the clusters.
            for (const c of clusters) {
                c.clear_observations();
            }
            // Place each observation in the cluster with the closest centroid.
            for (const o of observations) {
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
    }

    predict(observation) {
        return this.centroids.reduce((prev, curr) =>
            distance(prev, observation) < distance(curr, observation) ? prev : curr);
    }
}
