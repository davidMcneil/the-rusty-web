extern crate itertools;
extern crate libc;
extern crate rand;

mod kmeans;
mod kmeans_painter;

use kmeans_painter::KmeansPainter;
use std::mem;
use std::slice;

#[allow(no_mangle_generic_items)]
#[no_mangle]
pub unsafe extern "C" fn kmeans_painter_create<'a>(k: u16,
                                                   image_data: *mut u8,
                                                   size: usize)
                                                   -> *mut KmeansPainter<'a> {
    let image_data = slice::from_raw_parts_mut(image_data, size);
    mem::transmute(Box::new(KmeansPainter::new(k, image_data)))
}

#[no_mangle]
pub unsafe extern "C" fn kmeans_painter_step(kmeans_painter: *mut KmeansPainter, steps: u16) {
    let kmeans_painter = &mut *kmeans_painter;
    kmeans_painter.step(steps);
}

#[no_mangle]
pub unsafe extern "C" fn kmeans_painter_destroy(kmeans_painter: *mut KmeansPainter) {
    let _: Box<KmeansPainter> = mem::transmute(kmeans_painter);
}

// Paint image natively.
extern crate image;

fn main() {
    use kmeans::*;
    use self::image::{RgbImage, Pixel, Rgb};
    use std::path::Path;
    use std::time::Instant;

    let k = 5;
    let steps = 10;
    let in_file = "test.png";
    let out_file = "out.png";

    fn picture2observations(image: &RgbImage) -> Vec<Vec<Feature>> {
        let mut observations = Vec::new();
        for color in image.pixels() {
            let (r, g, b, _) = color.channels4();
            observations.push(vec![r as f64, g as f64, b as f64])
        }
        observations
    }

    fn observation2rgb(observation: &[Feature]) -> Rgb<u8> {
        Rgb::from_channels(observation[0] as u8,
                           observation[1] as u8,
                           observation[2] as u8,
                           255)
    }

    let start_time = Instant::now();
    let mut dynamic_image = image::open(&Path::new(in_file)).unwrap();
    let img = dynamic_image.as_mut_rgb8().unwrap();
    let observations = picture2observations(img);
    let mut kmeans = Kmeans::new(k);
    kmeans.train(&observations, steps);
    let width = img.width() as u32;
    for (i, observation) in observations.iter().enumerate() {
        let color = kmeans.predict(observation);
        img.put_pixel((i as u32 % width),
                      (i as u32 / width),
                      observation2rgb(&color));
    }
    let fout = Path::new(out_file);
    img.save(&fout).unwrap();
    let duration = start_time.elapsed();
    println!("Runtime {:.5}ms",
             (duration.as_secs() as f64) * 1000.0 + (duration.subsec_nanos() as f64) / 1_000_000.0);
}
