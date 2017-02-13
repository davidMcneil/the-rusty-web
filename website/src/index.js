/* External JavaScript Imports */
import "jquery";
import "bootstrap-slider";
import "../template/js/bootstrap.min.js";
/* JavaScript Imports */
import { ImageMemory } from "./image_memory";
import { JsKmeansPainter } from "./js_kmeans_painter";
import { RsKmeansPainter } from "./rs_kmeans_painter";
/* CSS Imports */
import "../node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css";
import "../template/css/bootstrap.css";
import "../template/css/landing-page.css";
import "../template/font-awesome/css/font-awesome.css";
import "./style.css";
/* Image Imports */
import default_image_filepath from "../../test.png";

const image2image_data = (image) => {
    const temp_canvas = document.createElement("canvas");
    const temp_canvas_context = temp_canvas.getContext("2d");
    temp_canvas.width = image.width;
    temp_canvas.height = image.height;
    temp_canvas_context.drawImage(image, 0, 0);
    return temp_canvas_context.getImageData(0, 0, image.width, image.height);
};

const filepath2image_data = (filepath) => (
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image2image_data(image));
        };
        image.onabort = (event) => (reject(event));
        image.onerror = (event) => (reject(event));
        image.src = filepath;
    })
);

const file2image_data = (file) => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        const image = new Image();
        reader.onload = (event) => {
            image.src = event.target.result;
            resolve(image2image_data(image));
        };
        reader.onabort = (event) => (reject(event));
        reader.onerror = (event) => (reject(event));
        reader.readAsDataURL(file);
    })
);

const draw_image_data = (image_data, canvas) => {
    const canvas_context = canvas.getContext("2d");
    const temp_canvas = document.createElement("canvas");
    const temp_canvas_context = temp_canvas.getContext("2d");
    temp_canvas.width = image_data.width;
    temp_canvas.height = image_data.height;
    temp_canvas_context.putImageData(image_data, 0, 0);
    canvas.width = window.innerWidth;
    canvas.height = (temp_canvas.height / temp_canvas.width) * canvas.width;
    canvas_context.drawImage(temp_canvas, 0, 0, temp_canvas.width, temp_canvas.height,
        0, 0, canvas.width, canvas.height);
};

const paint_canvas = (painter, steps, image_memory, canvas, msg) => {
    const start = performance.now();
    console.log(`Start: ${msg}.`);
    painter.step(steps);
    const end = performance.now();
    draw_image_data(image_memory.get_image_data(), canvas);
    console.log(`${msg}: ${Math.round(end - start)}ms`);
};

window.onload = () => {
    const file_upload = document.getElementById("file_upload");
    const reset_button = document.getElementById("reset_button");
    const k_range = document.getElementById("k_range");
    const steps_range = document.getElementById("steps_range");
    const javascript_button = document.getElementById("javascript_button");
    const asmjs_button = document.getElementById("asmjs_button");
    // const wasm_button = document.getElementById("wasm_button");
    const canvas = document.getElementById("image_canvas");

    $("#k_range").slider();
    $("#steps_range").slider();

    filepath2image_data(default_image_filepath).then((image_data) => {
        const default_image_data = image_data;
        let image_memory = null;
        let paint_javascript = () => { };
        let paint_asmjs = () => { };
        let reset = () => { };
        file_upload.onchange = (event) => {
            if (!event) {
                if (image_memory) { image_memory.free(); }
                image_memory = new ImageMemory(default_image_data);
                draw_image_data(image_memory.get_image_data(), canvas);
            } else if (event.target.files.length > 0) {
                const file = event.target.files[0];
                file2image_data(file).then((image_data) => {
                    if (image_memory) { image_memory.free(); }
                    image_memory = new ImageMemory(image_data);
                    draw_image_data(image_memory.get_image_data(), canvas);
                });
            } else {
                return;
            }
            const paint = (painter_class, msg) => {
                console.log(k_range.value);
                const painter = new painter_class(k_range.value, image_memory);
                paint_canvas(painter, steps_range.value, image_memory, canvas, msg);
            };
            javascript_button.removeEventListener("click", paint_javascript);
            asmjs_button.removeEventListener("click", paint_asmjs);
            reset_button.removeEventListener("click", reset);
            paint_javascript = () => paint(JsKmeansPainter, "js");
            paint_asmjs = () => paint(RsKmeansPainter, "rs");
            reset = () => draw_image_data(image_memory.reset(), canvas);
            javascript_button.addEventListener("click", paint_javascript);
            asmjs_button.addEventListener("click", paint_asmjs);
            reset_button.addEventListener("click", reset);
        };
        file_upload.onchange();
    });
};
