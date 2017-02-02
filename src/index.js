let img = new Image();
img.src = 'http://localhost:8000/tiger.jpg';

img.onload = function () { draw(this); };

/* Register external functions. */
let kmeans_painter_new = Module.cwrap("kmeans_painter_new", "number", ["number", "number", "number"]);
let kmeans_painter_step = Module.cwrap("kmeans_painter_step", null, ["number", "number"]);
let kmeans_painter_free = Module.cwrap("kmeans_painter_free", null, ["number"]);

function draw(img) {
    /* Setup arrays. */
    let byte_count = img.width * img.height * 4;
    let img_ptr = Module._malloc(byte_count);
    let img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
    /* Get the images starting data. */
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let width = canvas.width;
    let height = canvas.height;
    ctx.drawImage(img, 0, 0);
    img.style.display = "none";
    let image_data = ctx.getImageData(0, 0, width, height);
    /* Copy data into new array. */
    for (let i = 0; i < byte_count; i++) {
        img_array[i] = image_data.data[i];
    }
    image_data = new ImageData(img_array, width, height);
    let kmeans_painter_ptr = kmeans_painter_new(20, img_ptr, byte_count);

    let kmeans_callback = function () {
        kmeans_painter_step(kmeans_painter_ptr, 20);
        /* We now have a new heap. !!!! */
        img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
        image_data = new ImageData(img_array, width, height);
        ctx.putImageData(image_data, 0, 0);
        console.log("rendered");
    };

    let kmeans_button = document.getElementById('kmeans_button');
    kmeans_button.addEventListener('click', kmeans_callback);
}
