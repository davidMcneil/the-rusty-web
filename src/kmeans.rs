use rand;
use rand::Rng;
use std::cmp::Ordering;

pub type Feature = f64;

fn distance(observation_1: &[Feature], observation_2: &[Feature]) -> f64 {
    let mut sum_sqrs = 0.0;
    for i in 0..observation_1.len() {
        let diff = observation_1[i] - observation_2[i];
        sum_sqrs += diff * diff;
    }
    sum_sqrs.sqrt()
}

#[derive(PartialEq, PartialOrd)]
struct TotalOrderedF64(f64);

impl Eq for TotalOrderedF64 {}

impl Ord for TotalOrderedF64 {
    fn cmp(&self, other: &TotalOrderedF64) -> Ordering {
        self.partial_cmp(other).expect("Unable to compare TotalOrderedF64s.")
    }
}

#[derive(Debug)]
struct Cluster<'a> {
    centroid: Vec<Feature>,
    observations: Vec<&'a [Feature]>,
}

impl<'a> Cluster<'a> {
    fn new(centroid: Vec<Feature>) -> Cluster<'a> {
        Cluster {
            centroid: centroid,
            observations: Vec::new(),
        }
    }

    fn add_observation(&mut self, observation: &'a [Feature]) {
        self.observations.push(observation);
    }

    fn clear_observations(&mut self) {
        self.observations.clear();
    }

    fn distance(&self, observation: &[Feature]) -> f64 {
        distance(&self.centroid, observation)
    }

    fn set_centroid(&mut self) {
        self.centroid = self.observations
            .iter()
            .fold(vec![0.0; self.centroid.len()],
                  |acc, obs| obs.iter().zip(acc).map(|(o, a)| o + a).collect())
            .iter()
            .map(|f| f / (self.observations.len() as f64))
            .collect();
    }
}

#[derive(Debug)]
pub struct Kmeans {
    k: u16,
    centroids: Vec<Vec<Feature>>,
}

impl Kmeans {
    pub fn new(k: u16) -> Kmeans {
        Kmeans {
            k: k,
            centroids: Vec::new(),
        }
    }

    pub fn train(self: &mut Kmeans, observations: &[Vec<Feature>], steps: u16) {
        // If needed add randomly initialized centroids.
        while self.centroids.len() < self.k as usize {
            let random_observation = rand::thread_rng()
                .choose(observations)
                .expect("Unable to select random observation.");
            self.centroids.push(random_observation.clone());
        }
        // Create clusters from the centroids.
        let mut clusters: Vec<_> = self.centroids
            .iter()
            .map(|c| Cluster::new(c.clone()))
            .collect();
        let mut step = 0;
        while step < steps {
            // Clear all the observations from the clusters.
            for c in &mut clusters {
                c.clear_observations();
            }
            // Place each observation in the cluster with the closest centroid.
            for o in observations {
                clusters.iter_mut()
                    .min_by_key(|c| TotalOrderedF64(c.distance(o)))
                    .expect("Unable to determine closest cluster.")
                    .add_observation(o);
            }
            // Recalculate the centroid for each cluster.
            for c in &mut clusters {
                c.set_centroid();
            }
            step += 1;
        }
        // Make each cluster centroid a kmeans centroid.
        self.centroids.clear();
        for Cluster { centroid, .. } in clusters {
            self.centroids.push(centroid.clone());
        }
    }

    pub fn predict(self: &Kmeans, observation: &[Feature]) -> Vec<Feature> {
        self.centroids
            .iter()
            .min_by_key(|c| TotalOrderedF64(distance(c, observation)))
            .expect("Unable to determine closest centroid.")
            .clone()
    }
}
