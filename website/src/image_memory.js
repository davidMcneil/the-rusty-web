const BYTES_PER_PIXEL = 4;

export class ImageMemory {
    constructor(image_data, module) {
        this.module = module;
        this.initial_image_data = image_data;
        this.width = image_data.width;
        this.height = image_data.height;
        this.byte_count = this.width * this.height * BYTES_PER_PIXEL;
        this.ptr = this.module._malloc(this.byte_count);
        this.reset();
    }

    get_byte_count() {
        return this.byte_count;
    }

    get_ptr() {
        return this.ptr;
    }

    get_image_array() {
        return new Uint8Array(this.module.HEAPU8.buffer, this.ptr, this.byte_count);
    }

    get_image_data() {
        /* We can not simply cache img_array, but must pull it from Module's heap every time.
           This is because our heap array may have grown and been allocated a new memory
           location. */
        let img_array = new Uint8ClampedArray(this.module.HEAPU8.buffer, this.ptr, this.byte_count);
        return new ImageData(img_array, this.width, this.height);
    }

    reset() {
        let img_array = this.get_image_array();
        for (let i = 0; i < this.byte_count; i++) {
            img_array[i] = this.initial_image_data.data[i];
        }
        return this.initial_image_data;
    }

    free() {
        this.module._free(this.ptr);
    }
}
