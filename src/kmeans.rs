use rand;
use rand::Rng;
use std::cmp::Ordering;

pub type Features = Vec<f64>;

fn distance(observation_1: &Features, observation_2: &Features) -> f64 {
    observation_1.iter()
        .zip(observation_2)
        .fold(0.0, |acc, (o1, o2)| acc + (o1 - o2).powi(2))
        .sqrt()
}

#[derive(PartialEq, PartialOrd)]
struct NonNan(f64);

impl Eq for NonNan {}

impl Ord for NonNan {
    fn cmp(&self, other: &NonNan) -> Ordering {
        self.partial_cmp(other).unwrap()
    }
}

#[derive(Debug)]
pub struct Cluster<'a> {
    centroid: Features,
    observations: Vec<&'a Features>,
}

impl<'a> Cluster<'a> {
    fn new(centroid: Features) -> Cluster<'a> {
        Cluster {
            centroid: centroid,
            observations: Vec::new(),
        }
    }

    fn add_observation(&mut self, observation: &'a Features) {
        self.observations.push(observation);
    }

    fn clear_observations(&mut self) {
        self.observations.clear();
    }

    fn distance(&self, observation: &Features) -> f64 {
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
    centroids: Vec<Features>,
}

impl Kmeans {
    pub fn new(k: u16) -> Kmeans {
        Kmeans {
            k: k,
            centroids: Vec::new(),
        }
    }

    pub fn train(self: &mut Kmeans, observations: &[Features], steps: u16) {
        // Add random centroids if needed.
        while self.centroids.len() < self.k as usize {
            let random_observation = rand::thread_rng().choose(observations).unwrap();
            self.centroids.push(random_observation.clone());
        }
        // Create clusters.
        let mut clusters: Vec<_> = self.centroids
            .iter()
            .map(|c| Cluster::new(c.clone()))
            .collect();
        let mut step = 0;
        while step < steps {
            // Clear all observations in clusters.
            for c in clusters.iter_mut() {
                c.clear_observations();
            }
            // Place each observation in the cluster with the closest centroid.
            for o in observations.iter() {
                clusters.iter_mut()
                    .min_by_key(|c| NonNan(c.distance(&o)))
                    .unwrap()
                    .add_observation(&o);
            }
            // Recalculate the centroid for each cluster.
            for cluster in clusters.iter_mut() {
                cluster.set_centroid();
            }
            step += 1;
        }
        // Make each cluster centroid a kmeans centroid.
        self.centroids.clear();
        for Cluster { centroid, .. } in clusters {
            self.centroids.push(centroid.clone());
        }
    }

    pub fn predict(self: &Kmeans, observation: &Features) -> Features {
        self.centroids
            .iter()
            .min_by_key(|c| NonNan(distance(c, observation)))
            .unwrap()
            .clone()
    }
}
