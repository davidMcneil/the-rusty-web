#![feature(link_args)]
#[link_args = "-s EXPORTED_FUNCTIONS=['_kmeans_painter_new','_kmeans_painter_step','_kmeans_painter_free'] -s ALLOW_MEMORY_GROWTH=1"]

extern "C" {}

extern crate itertools;
extern crate rand;
extern crate libc;

mod painter;
mod kmeans;

use painter::KmeansPainter;
use std::slice;
use std::mem;

#[allow(no_mangle_generic_items)]
#[no_mangle]
pub extern "C" fn kmeans_painter_new<'a>(k: u16,
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
pub extern "C" fn kmeans_painter_free(kmeans_painter: *mut KmeansPainter) {
    let _: Box<KmeansPainter> = unsafe { mem::transmute(kmeans_painter) };
}

fn main() {}
