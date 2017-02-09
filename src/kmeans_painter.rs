use itertools::Itertools;
use kmeans::{Feature, Kmeans};

#[derive(Debug)]
pub struct KmeansPainter<'a> {
    image_data: &'a mut [u8],
    observations: Vec<Vec<Feature>>,
    kmeans: Kmeans,
}

impl<'a> KmeansPainter<'a> {
    pub fn new(k: u16, image_data: &'a mut [u8]) -> KmeansPainter<'a> {
        // Convert each pixel into an observation consisting of a red, blue, and green component.
        let observations: Vec<_> = (0..image_data.len())
            .step(4)
            .map(|i| vec![image_data[i] as f64, image_data[i + 1] as f64, image_data[i + 2] as f64])
            .collect();
        KmeansPainter {
            image_data: image_data,
            observations: observations,
            kmeans: Kmeans::new(k),
        }
    }

    pub fn step(&mut self, steps: u16) {
        self.kmeans.train(&self.observations, steps);
        // Color each pixel based on the predicted color.
        for (i, o) in self.observations.iter().enumerate() {
            let color = self.kmeans.predict(o);
            self.image_data[(i * 4)] = color[0] as u8;
            self.image_data[(i * 4) + 1] = color[1] as u8;
            self.image_data[(i * 4) + 2] = color[2] as u8;
        }
    }
}
