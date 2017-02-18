/* External JavaScript Imports */
import $ from "jquery";
/* JavaScript Imports */
import "./template/bootstrap.min.js";
import { ImageMemory } from "./image_memory";
import { JsKmeansPainter } from "./js_kmeans_painter";
import { AsmjsKmeansPainter } from "./asmjs_kmeans_painter";
/* CSS Imports */
import "./template/bootstrap.css";
import "./template/landing-page.css";
import "./template/font-awesome/css/font-awesome.min.css";
import "./style.css";
/* Image Imports */
import default_image_filepath from "../../img/default.jpg";

let STOP = false;

const image2image_data = (image) => {
    const temp_canvas = document.createElement("canvas");
    const temp_canvas_context = temp_canvas.getContext("2d");
    temp_canvas.width = image.width;
    temp_canvas.height = image.height;
    console.log(image.width);
    temp_canvas_context.drawImage(image, 0, 0);
    return temp_canvas_context.getImageData(0, 0, image.width, image.height);
};

const filepath2image_data = (filepath) => (
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            console.log(image);
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
            console.log(image.src);
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

const add_stats = (painter, image_data, times) => {
    times.sort();
    const length = times.length;
    let total = 0;
    const min = times[0];
    const max = times[length - 1];
    for (let time of times) {
        total += time;
    }
    const half = Math.floor(length / 2);
    let median;
    if (length % 2) { median = times[half]; }
    else { median = (times[half - 1] + times[half]) / 2.0; }
    const average = total / length;
    if ($("#results_table tbody tr").first().hasClass("no-results-row")) {
        $("#results_table tr:last").remove();
    }
    $("#results_table").prepend(
        "<tr>" +
        `  <td>${painter.get_identifier()}</td>` +
        `  <td>${painter.get_k()}</td>` +
        `  <td>${length}</td>` +
        `  <td>${image_data.width}x${image_data.height}</td>` +
        `  <td> ${Math.round(total)}</td>` +
        `  <td> ${Math.round(average)}</td>` +
        `  <td> ${Math.round(median)}</td>` +
        `  <td> ${Math.round(min)}</td>` +
        `  <td> ${Math.round(max)}</td>` +
        "</tr>"
    );
};

const paint_canvas = (painter, steps, image_memory, canvas, times = []) => {
    if (steps > 0 && !STOP) {
        $("#spinner").show();
        setTimeout(() => {
            const start = performance.now();
            painter.step(1);
            const end = performance.now();
            times.push(end - start);
            draw_image_data(image_memory.get_image_data(), canvas);
            paint_canvas(painter, steps - 1, image_memory, canvas, times);
        }, 20);
    } else {
        $("#spinner").hide();
        STOP = false;
        add_stats(painter, image_memory.get_image_data(), times);
        painter.free();
    }
};

const get_val = (element) => (
    (element.val() && parseInt(element.val())) > 0 ? parseInt(element.val()) : 1
);

$(document).ready(() => {
    const file_upload = $("#file_upload");
    const reset_button = $("#reset_button");
    const k_range = $("#k_range");
    const steps_range = $("#steps_range");
    const javascript_button = $("#javascript_button");
    const asmjs_button = $("#asmjs_button");
    const wasm_button = $("#wasm_button");
    const canvas = document.getElementById("image_canvas");

    /* Setup the numeric-input elements. */
    $(".numeric-input").each((_, numeric_input) => {
        const input = $(numeric_input).find("input");
        /* Only allow numbers. */
        input.keydown((event) => {
            return (event.ctrlKey || event.altKey
                || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
                || (95 < event.keyCode && event.keyCode < 106)
                || (event.keyCode == 8) || (event.keyCode == 9)
                || (event.keyCode > 34 && event.keyCode < 40)
                || (event.keyCode == 46));
        });
        const buttons = $(numeric_input).find("button");
        const increase = $(buttons[0]);
        const decrease = $(buttons[1]);
        increase.click(() => input.val(get_val(input) + 1));
        decrease.click(() => {
            if (get_val(input) > 1) {
                input.val(get_val(input) - 1);
            }
        });
    });

    /* Set event handler for custom file upload. */
    $("#file_upload_button").click(() => file_upload.click());

    /* Set event handler for stop button. */
    $("#stop_button").click(() => STOP = true);

    /* Remove focus from button after being pressed. Use function to access 'this'. */
    $(".btn").mouseup(function () { $(this).blur(); });

    /* wasm is currently not implemented. */
    wasm_button.prop("disabled", true);

    /* Load the default image. */
    filepath2image_data(default_image_filepath).then((default_image_data) => {
        let image_memory = null;
        /* Set event handler for reset button. */
        reset_button.click(() => {
            javascript_button.prop("disabled", false);
            asmjs_button.prop("disabled", false);
            draw_image_data(image_memory.reset(), canvas);
        });
        const new_image = (new_image_data) => {
            javascript_button.prop("disabled", false);
            asmjs_button.prop("disabled", false);
            if (image_memory) { image_memory.free(); }
            image_memory = new ImageMemory(new_image_data);
            draw_image_data(image_memory.get_image_data(), canvas);
        };
        const paint = (painter_class) => {
            STOP = false;
            javascript_button.prop("disabled", true);
            asmjs_button.prop("disabled", true);
            const painter = new painter_class(get_val(k_range), image_memory);
            paint_canvas(painter, get_val(steps_range), image_memory, canvas);
        };
        file_upload.change((event) => {
            if (!event.originalEvent) { /* The default image case. */
                new_image(default_image_data);
            } else if (event.target.files.length > 0) { /* New file selected case. */
                const file = event.target.files[0];
                file2image_data(file).then((image_data) => new_image(image_data));
            } else { return; } /* No new file selected case. */
            javascript_button.off(); asmjs_button.off();
            javascript_button.click(() => paint(JsKmeansPainter));
            asmjs_button.click(() => paint(AsmjsKmeansPainter));
        });
        /* Trigger a change to load the default image. */
        file_upload.change();
    });
});
