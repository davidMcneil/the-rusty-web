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
pub unsafe extern "C" fn kmeans_painter_new<'a>(k: u16,
                                                image_data: *mut u8,
                                                size: usize)
                                                -> *mut KmeansPainter<'a> {
    let image_data = slice::from_raw_parts_mut(image_data, size);
    let kmeans_painter = KmeansPainter::new(k, image_data);
    let kmeans_painter_size = mem::size_of::<KmeansPainter>();
    let new_ptr = libc::malloc(kmeans_painter_size) as *mut KmeansPainter;
    let old_ptr = &kmeans_painter as *const KmeansPainter;
    libc::memcpy(new_ptr as *mut libc::c_void,
                 old_ptr as *const libc::c_void,
                 kmeans_painter_size);
    new_ptr
}

#[no_mangle]
pub unsafe extern "C" fn kmeans_painter_step(kmeans_painter: *mut KmeansPainter, steps: u16) {
    let kmeans_painter = &mut *kmeans_painter;
    kmeans_painter.step(steps);
}

#[no_mangle]
pub unsafe extern "C" fn kmeans_painter_free(kmeans_painter: *mut KmeansPainter) {
    libc::free(kmeans_painter as *mut libc::c_void);
}

fn main() {}
