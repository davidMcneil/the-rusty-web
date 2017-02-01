extern {
    fn printf(__format : *const u8, ...) -> i32;
}

#[no_mangle]
pub unsafe extern fn invert(mut data : *mut u8, mut size : usize) {
    printf((*b"---Invert---\n\0").as_ptr());
    let mut i : i32 = 0i32;
    'loop1: loop {
        if i as (usize) < size {
            *data.offset(i as (isize)) = (255i32 - *data.offset(
                                                        i as (isize)
                                                    ) as (i32)) as (u8);
            *data.offset((i + 1i32) as (isize)) = (255i32 - *data.offset(
                                                                 (i + 1i32) as (isize)
                                                             ) as (i32)) as (u8);
            *data.offset((i + 2i32) as (isize)) = (255i32 - *data.offset(
                                                                 (i + 2i32) as (isize)
                                                             ) as (i32)) as (u8);
            i = i + 4i32;
            continue 'loop1;
        } else {
            break 'loop1;
        }
    }
}

#[no_mangle]
pub unsafe extern fn grayscale(mut data : *mut u8, mut size : usize) {
    printf((*b"---Grayscale---\n\0").as_ptr());
    let mut i : i32 = 0i32;
    'loop1: loop {
        if i as (usize) < size {
            let mut avg
                : i32
                = (*data.offset(i as (isize)) as (i32) + *data.offset(
                                                              (i + 1i32) as (isize)
                                                          ) as (i32) + *data.offset(
                                                                            (i + 2i32) as (isize)
                                                                        ) as (i32)) / 3i32;
            *data.offset(i as (isize)) = avg as (u8);
            *data.offset((i + 1i32) as (isize)) = avg as (u8);
            *data.offset((i + 2i32) as (isize)) = avg as (u8);
            i = i + 4i32;
            continue 'loop1;
        } else {
            break 'loop1;
        }
    }
}
