use itertools::Itertools;
use kmeans::{Features, kmeans, Observation};

#[derive(Debug)]
pub struct KmeansPainter<'a> {
    k: u16,
    image_data: &'a mut [u8],
}

impl<'a> KmeansPainter<'a> {
    pub fn new(k: u16, image_data: &mut [u8]) -> KmeansPainter {
        print!("Created a new KmeansPainter");
        KmeansPainter {
            k: k,
            image_data: image_data,
        }
    }

    pub fn step(&mut self, steps: u16) {
        kmeans_painter(self.k, steps, self.image_data);
    }
}

#[derive(Debug, Clone)]
struct Pixel {
    features: Vec<f64>,
    index: usize,
}

impl Observation for Pixel {
    fn features(&self) -> Features {
        self.features.clone()
    }
}

pub fn kmeans_painter(k: u16, steps: u16, img_data: &mut [u8]) {
    println!("---Kmeans Rust---");
    let observations: Vec<_> = (0..img_data.len())
        .step(4)
        .map(|i| {
            let features = vec![img_data[i] as f64 / 255.0,
                                img_data[i + 1] as f64 / 255.0,
                                img_data[i + 2] as f64 / 255.0];
            Pixel {
                features: features,
                index: i,
            }
        })
        .collect();
    let clusters = kmeans(&observations, k, Some(steps as u64)).unwrap();
    for c in clusters {
        let r = (c.centroid()[0] * 255.0) as u8;
        let g = (c.centroid()[1] * 255.0) as u8;
        let b = (c.centroid()[2] * 255.0) as u8;
        println!("{:?} {:?} {:?}", r, g, b);
        for &Pixel { index, .. } in c.observations() {
            img_data[index] = r;
            img_data[index + 1] = g;
            img_data[index + 2] = b;
        }
    }
}
