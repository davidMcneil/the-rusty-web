use rand;
use rand::Rng;
use std::cmp::Ordering;
use std::fmt::Debug;
use std::time::Instant;
use std::u64;

pub type Features = Vec<f64>;

pub trait Observation: Debug + Clone {
    fn features(&self) -> Features;
}

#[derive(Debug)]
pub struct Cluster<T: Observation> {
    centroid: Features,
    observations: Vec<T>,
}

impl<T: Observation> Cluster<T> {
    fn new(observation: &T) -> Cluster<T> {
        Cluster {
            centroid: observation.features(),
            observations: Vec::new(),
        }
    }

    fn add_observation(&mut self, observation: T) {
        self.observations.push(observation);
    }

    fn clear_observations(&mut self) {
        self.observations.clear();
    }

    pub fn centroid(&self) -> &Features {
        &self.centroid
    }

    pub fn observations(&self) -> &Vec<T> {
        &self.observations
    }

    fn distance(&self, observation: &T) -> f64 {
        self.centroid
            .iter()
            .zip(observation.features())
            .fold(0.0, |acc, (f1, f2)| acc + (f1 - f2).powi(2))
            .sqrt()
    }

    fn set_centroid(&mut self) -> bool {
        let orginal_centroid = self.centroid.clone();
        self.centroid = self.observations
            .iter()
            .fold(vec![0.0; self.centroid.len()],
                  |acc, o| o.features().iter().zip(acc).map(|(f1, f2)| f1 + f2).collect())
            .iter()
            .map(|f| f / (self.observations.len() as f64))
            .collect();
        self.centroid != orginal_centroid
    }
}

#[derive(PartialEq, PartialOrd)]
struct NonNan(f64);

impl Eq for NonNan {}

impl Ord for NonNan {
    fn cmp(&self, other: &NonNan) -> Ordering {
        self.partial_cmp(other).unwrap()
    }
}

#[allow(dead_code)]
pub fn kmeans<T: Observation>(observations: &[T],
                              k: u16,
                              max_iterations: Option<u64>)
                              -> Result<Vec<Cluster<T>>, String> {
    let num_observations = observations.len();
    let k = k as usize;
    if num_observations < k {
        return Err(format!("Number of observations ({}) less than number of clusters ({}).",
                           num_observations,
                           k));
    }
    // Initialize the centroids of the clusters to random observation features.
    let mut random_indexes: Vec<_> = (0..num_observations).collect();
    rand::thread_rng().shuffle(&mut random_indexes);
    let mut clusters: Vec<_> = random_indexes.iter()
        .take(k)
        .map(|i| Cluster::new(&observations[*i]))
        .collect();
    let mut iterations = 0;
    let max_iterations = max_iterations.unwrap_or(u64::max_value());
    let mut changed = true;
    while changed && iterations < max_iterations {
        let start_time = Instant::now();
        // Clear all observations in clusters.
        for c in clusters.iter_mut() {
            c.clear_observations();
        }
        // Place each observation in the cluster with the closest centroid.
        for o in observations.iter().cloned() {
            clusters.iter_mut()
                .min_by_key(|c| NonNan(c.distance(&o)))
                .unwrap()
                .add_observation(o);
        }
        // Recalculate the centroid for each cluster and check for the break condition.
        let changes: Vec<_> = clusters.iter_mut().map(|c| c.set_centroid()).collect();
        changed = changes.iter().any(|change| *change);
        iterations += 1;
        let duration = start_time.elapsed();
        println!("Iteration {:?} took {:.3}ms",
                 iterations,
                 (duration.as_secs() as f64) * 1000f64 +
                 (duration.subsec_nanos() as f64) / 1_000_000f64);
    }
    Ok(clusters)
}

#[cfg(test)]
mod tests {
    use kmeans::*;

    impl Observation for (f64, f64) {
        fn features(&self) -> Features {
            vec![self.0, self.1]
        }
    }

    impl Observation for (u8, u8, u8) {
        fn features(&self) -> Features {
            vec![self.0 as f64, self.1 as f64, self.2 as f64]
        }
    }

    impl Observation for (u8, u8, u8, u8) {
        fn features(&self) -> Features {
            vec![self.0 as f64, self.1 as f64, self.2 as f64, self.3 as f64]
        }
    }

    impl Observation for Vec<f64> {
        fn features(&self) -> Features {
            self.clone()
        }
    }

    #[test]
    fn distance_test() {
        let f1 = (14, 5, 6);
        let f2 = (14, 5, 7);
        assert_eq!(Cluster::new(&f1).distance(&f1), 0.0);
        assert_eq!(Cluster::new(&f1).distance(&f2), 1.0);
        let f1 = (100.0, -17.12);
        let f2 = (600.45, 37.0);
        assert_eq!(Cluster::new(&f1).distance(&f2), 503.3678345901733);
        let f1 = (1, 2, 3, 4);
        let f2 = (5, 6, 7, 8);
        assert_eq!(Cluster::new(&f1).distance(&f2), 8.0);
    }

    #[test]
    fn kmeans_test() {
        let v = vec![(1, 2, 3),
                     (3, 2, 1),
                     (4, 5, 6),
                     (10, 11, 12),
                     (11, 11, 11),
                     (15, 13, 12),
                     (19, 10, 11)];
        let clusters = kmeans(&v, 2, None).unwrap();
        assert!(clusters.iter()
            .any(|c| c.centroid == vec![2.6666666666666665, 3.0, 3.3333333333333335]));
        assert!(clusters.iter().any(|c| c.centroid == vec![13.75, 11.25, 11.5]));
    }
}
