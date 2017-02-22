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
    use kmeans_painter::KmeansPainter;
    use self::image::{Pixel, Rgb};
    use std::path::Path;
    use std::time::Instant;

    const BYTES_PER_PIXEL: usize = 4;

    // Set parameters.
    let k = 10;
    let steps = 3;
    let in_file = "img/default.jpg";
    let out_file = "img/out.jpg";
    // Open the image.
    let mut dynamic_image = image::open(&Path::new(in_file)).unwrap();
    let image = dynamic_image.as_mut_rgb8().unwrap();
    // Create image data in the same representation browsers uses.
    let mut image_data = Vec::new();
    for pixel in image.pixels() {
        let (red, green, blue, alpha) = pixel.channels4();
        image_data.push(red);
        image_data.push(green);
        image_data.push(blue);
        image_data.push(alpha);
    }
    // Paint the image.
    let mut durations = Vec::new();
    {
        let mut painter = KmeansPainter::new(k, &mut image_data);
        for _ in 0..steps {
            let start_time = Instant::now();
            painter.step(1);
            let duration = start_time.elapsed();
            durations.push(duration);
        }
    }
    // Color each pixel given the new image data.
    let width = image.width() as usize;
    let height = image.height() as usize;
    for i in 0..width * height {
        let pixel = Rgb::from_channels(image_data[i * BYTES_PER_PIXEL],
                                       image_data[i * BYTES_PER_PIXEL + 1],
                                       image_data[i * BYTES_PER_PIXEL + 2],
                                       image_data[i * BYTES_PER_PIXEL + 3]);
        image.put_pixel((i % width) as u32, (i / width) as u32, pixel);
    }
    // Save the image.
    let fout = Path::new(out_file);
    image.save(&fout).unwrap();
    // Calculate and print the statistics.
    durations.sort();
    let mut times = Vec::new();
    for d in durations {
        times.push((d.as_secs() as f64) * 1000.0 + ((d.subsec_nanos() as f64) / 1_000_000.0));
    }
    let length = times.len();
    let total = times.iter().fold(0.0, |acc, t| acc + t);
    let average = total / length as f64;
    let half = length / 2;
    let median = if (length % 2) != 0 {
        times[half]
    } else {
        (times[half - 1] + times[half]) / 2.0
    };
    let min = times[0];
    let max = times[length - 1];
    println!("k:             {:}", k);
    println!("Steps:         {:}", steps);
    println!("Size (pixels): {:}x{}", width, height);
    println!("Total (ms):    {:.0}", total);
    println!("Average (ms):  {:.0}", average);
    println!("Median (ms):   {:.0}", median);
    println!("Min (ms):      {:.0}", min);
    println!("Max (ms):      {:.0}", max);
}
