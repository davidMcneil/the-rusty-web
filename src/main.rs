#![feature(link_args)]
#[link_args = "-s EXPORTED_FUNCTIONS=['_kmeans_painter_create','_kmeans_painter_step','_kmeans_painter_destroy'] -s ALLOW_MEMORY_GROWTH=1"]

extern "C" {}

extern crate itertools;
extern crate libc;
extern crate rand;

mod kmeans;
mod painter;

use painter::KmeansPainter;
use std::mem;
use std::slice;

#[allow(no_mangle_generic_items)]
#[no_mangle]
pub extern "C" fn kmeans_painter_create<'a>(k: u16,
                                            image_data: *mut u8,
                                            size: usize)
                                            -> *mut KmeansPainter<'a> {
    let image_data = unsafe { slice::from_raw_parts_mut(image_data, size) };
    let kmeans_painter = unsafe { mem::transmute(Box::new(KmeansPainter::new(k, image_data))) };
    kmeans_painter
}

#[no_mangle]
pub extern "C" fn kmeans_painter_step(kmeans_painter: *mut KmeansPainter, steps: u16) {
    let kmeans_painter = unsafe { &mut *kmeans_painter };
    kmeans_painter.step(steps);
}

#[no_mangle]
pub extern "C" fn kmeans_painter_destroy(kmeans_painter: *mut KmeansPainter) {
    let _: Box<KmeansPainter> = unsafe { mem::transmute(kmeans_painter) };
}


// Run kmeans locally.
extern crate image;

fn main() {
    use kmeans::*;
    use self::image::{RgbImage, Pixel, Rgb};
    use std::path::Path;
    use std::time::Instant;

    fn picture2observations(image: &RgbImage) -> Vec<Features> {
        let mut observations = Vec::new();
        for color in image.pixels() {
            let (r, g, b, _) = color.channels4();
            let (r, g, b) = (r as f64, g as f64, b as f64);
            observations.push(vec![r, g, b])
        }
        observations
    }

    fn features2rgb(features: &Features) -> Rgb<u8> {
        Rgb::from_channels(features[0] as u8, features[1] as u8, features[2] as u8, 255)
    }

    let start_time = Instant::now();
    let mut dynamic_image = image::open(&Path::new("test.png")).unwrap();
    let img = dynamic_image.as_mut_rgb8().unwrap();
    let observations = picture2observations(img);
    let mut kmeans = Kmeans::new(5);
    kmeans.train(&observations, 10);
    let width = img.width() as u32;
    for (i, observation) in observations.iter().enumerate() {
        let color = kmeans.predict(observation);
        img.put_pixel((i as u32 % width), (i as u32 / width), features2rgb(&color));
    }
    let fout = Path::new("out.png");
    let _ = img.save(&fout).unwrap();
    let duration = start_time.elapsed();
    println!("Runtime {:.3} ms",
             (duration.as_secs() as f64) * 1000f64 +
             (duration.subsec_nanos() as f64) / 1_000_000f64);
}
