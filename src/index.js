const K = 3;
const STEPS = 5;
let js_img = new Image();
js_img.src = 'http://localhost:8000/tiger.jpg';
js_img.onload = function () { setup_painter(this, "js", "js_canvas", "js_button", JsKmeansPainter); };
let rs_img = new Image();
rs_img.src = 'http://localhost:8000/tiger.jpg';
rs_img.onload = function () { setup_painter(this, "rs", "rs_canvas", "rs_button", RsKmeansPainter); };

const setup_painter = (img, msg, canvas_id, button_id, painter_class) => {
    /* Setup arrays. */
    const byte_count = img.width * img.height * 4;
    const img_ptr = Module._malloc(byte_count);
    let img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
    /* Get the images starting data. */
    const canvas = document.getElementById(canvas_id);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.drawImage(img, 0, 0);
    img.style.display = "none";
    let image_data = ctx.getImageData(0, 0, width, height);
    /* Copy data into new array. */
    for (let i = 0; i < byte_count; i++) {
        img_array[i] = image_data.data[i];
    }
    image_data = new ImageData(img_array, width, height);
    const painter = new painter_class(K, img_ptr, byte_count);
    /* !!!! We may now have a new heap. !!!! */
    img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
    image_data = new ImageData(img_array, width, height);

    const paint = () => {
        var t0 = performance.now();
        console.log("Start: " + msg)
        painter.step(STEPS);
        ctx.putImageData(image_data, 0, 0);
        var t1 = performance.now();
        console.log(msg + ": " + Math.round(t1 - t0) + " ms")
    };

    const button = document.getElementById(button_id);
    button.addEventListener("click", paint);
}

window.onload = () => {
    const race_button = document.getElementById("race_button");
    const rs_button = document.getElementById("rs_button");
    const js_button = document.getElementById("js_button");
    race_button.addEventListener("click", () => {
        js_button.click();
        rs_button.click();
    });
};
