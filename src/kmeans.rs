use rand;
use rand::Rng;
use std::cmp::Ordering;

pub type Features = Vec<f64>;

fn distance(observation_1: &Features, observation_2: &Features) -> f64 {
    observation_1.iter()
        .zip(observation_2)
        .fold(0.0, |acc, (f1, f2)| acc + (f1 - f2).powi(2))
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

    pub fn centroids(self: &Kmeans) -> &Vec<Features> {
        &self.centroids
    }
}

#[cfg(test)]
mod tests {
    extern crate image;
    use kmeans::*;
    use self::image::{RgbImage, Pixel, Rgb};
    use std::path::Path;

    #[test]
    fn distance_test() {
        let f1 = vec![14.0, 5.0, 6.0];
        let f2 = vec![14.0, 5.0, 7.0];
        assert_eq!(Cluster::new(f1.clone()).distance(&f1), 0.0);
        assert_eq!(Cluster::new(f1.clone()).distance(&f2), 1.0);
        let f1 = vec![100.0, -17.12];
        let f2 = vec![600.45, 37.0];
        assert_eq!(Cluster::new(f1.clone()).distance(&f2), 503.3678345901733);
        let f1 = vec![1.0, 2.0, 3.0, 4.0];
        let f2 = vec![5.0, 6.0, 7.0, 8.0];
        assert_eq!(Cluster::new(f1.clone()).distance(&f2), 8.0);
    }

    #[test]
    fn kmeans_test_1() {
        let observations = vec![vec![1.0, 2.0, 3.0],
                                vec![3.0, 2.0, 1.0],
                                vec![4.0, 5.0, 6.0],
                                vec![10.0, 11.0, 12.0],
                                vec![11.0, 11.0, 11.0],
                                vec![15.0, 13.0, 12.0],
                                vec![19.0, 10.0, 11.0]];
        let mut kmeans = Kmeans::new(2);
        kmeans.train(&observations, 20);
        let centroids = kmeans.centroids();
        assert!(centroids.iter()
            .any(|c| *c == vec![2.6666666666666665, 3.0, 3.3333333333333335]));
        assert!(centroids.iter().any(|c| *c == vec![13.75, 11.25, 11.5]));
    }

    pub fn picture2observations(image: &RgbImage) -> Vec<Features> {
        let mut observations = Vec::new();
        for color in image.pixels() {
            let (r, g, b, _) = color.channels4();
            let (r, g, b) = (r as f64 / 255.0, g as f64 / 255.0, b as f64 / 255.0);
            observations.push(vec![r, g, b])
        }
        observations
    }

    fn features2rgb(features: &Features) -> Rgb<u8> {
        Rgb::from_channels((features[0] * 255.0) as u8,
                           (features[1] * 255.0) as u8,
                           (features[2] * 255.0) as u8,
                           255)
    }

    #[test]
    fn kmeans_test_2() {
        let mut dynamic_image = image::open(&Path::new("tiger.jpg")).unwrap();
        let img = dynamic_image.as_mut_rgb8().unwrap();
        let observations = picture2observations(img);
        let mut kmeans = Kmeans::new(15);
        kmeans.train(&observations, 40);
        let width = img.width() as u32;
        for (i, observation) in observations.iter().enumerate() {
            let color = kmeans.predict(observation);
            img.put_pixel((i as u32 % width), (i as u32 / width), features2rgb(&color));
        }
        // color(&clusters, img);
        let fout = Path::new("out.png");
        let _ = img.save(&fout).unwrap();
    }
}
