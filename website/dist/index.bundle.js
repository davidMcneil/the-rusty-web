/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JsKmeansPainter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global Module */


var _kmeans = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JsKmeansPainter = exports.JsKmeansPainter = function () {
    function JsKmeansPainter(k, img_ptr, byte_count) {
        _classCallCheck(this, JsKmeansPainter);

        this.img_data = new Uint8Array(Module.HEAPU8.buffer, img_ptr, byte_count);
        this.observations = [];
        // Convert each pixel into an observation consisting of a red, blue, and green component.
        for (var i = 0; i < this.img_data.length; i += 4) {
            this.observations.push([this.img_data[i], this.img_data[i + 1], this.img_data[i + 2]]);
        }
        this.kmeans = new _kmeans.Kmeans(k);
    }

    _createClass(JsKmeansPainter, [{
        key: "step",
        value: function step(steps) {
            var _this = this;

            this.kmeans.train(this.observations, steps);
            // Color each pixel based on the predicted color.
            this.observations.forEach(function (o, i) {
                var color = _this.kmeans.predict(o);
                _this.img_data[i * 4] = color[0];
                _this.img_data[i * 4 + 1] = color[1];
                _this.img_data[i * 4 + 2] = color[2];
            });
        }
    }]);

    return JsKmeansPainter;
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global Module */
var create = Module.cwrap("kmeans_painter_create", "number", ["number", "number", "number"]);
var _step = Module.cwrap("kmeans_painter_step", null, ["number", "number"]);
var destroy = Module.cwrap("kmeans_painter_destroy", null, ["number"]);

var RsKmeansPainter = exports.RsKmeansPainter = function () {
    function RsKmeansPainter(k, img_ptr, byte_count) {
        _classCallCheck(this, RsKmeansPainter);

        this.ptr = create(k, img_ptr, byte_count);
    }

    _createClass(RsKmeansPainter, [{
        key: "step",
        value: function step(steps) {
            _step(this.ptr, steps);
        }
    }, {
        key: "free",
        value: function free() {
            destroy(this.ptr);
        }
    }]);

    return RsKmeansPainter;
}();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _distance = function _distance(observation_1, observation_2) {
    var sum_sqrs = 0;
    for (var i = 0; i < observation_1.length; i++) {
        sum_sqrs += Math.pow(observation_1[i] - observation_2[i], 2);
    }
    return Math.sqrt(sum_sqrs);
};

var Cluster = function () {
    function Cluster(centroid) {
        _classCallCheck(this, Cluster);

        this.centroid = centroid;
        this.observations = [];
    }

    _createClass(Cluster, [{
        key: "add_observation",
        value: function add_observation(observation) {
            this.observations.push(observation);
        }
    }, {
        key: "clear_observations",
        value: function clear_observations() {
            this.observations = [];
        }
    }, {
        key: "distance",
        value: function distance(observation) {
            return _distance(this.centroid, observation);
        }
    }, {
        key: "set_centroid",
        value: function set_centroid() {
            var _this = this;

            var empty = new Array(this.centroid.length).fill(0);
            this.centroid = this.observations.reduce(function (acc, obs) {
                return obs.map(function (o, i) {
                    return o + acc[i];
                });
            }, empty).map(function (f) {
                return f / _this.observations.length;
            });
        }
    }]);

    return Cluster;
}();

var Kmeans = exports.Kmeans = function () {
    function Kmeans(k) {
        _classCallCheck(this, Kmeans);

        this.k = k;
        this.centroids = [];
    }

    _createClass(Kmeans, [{
        key: "train",
        value: function train(observations, steps) {
            // Add randomly initialized centroids if needed.
            while (this.centroids.length < this.k) {
                var random_index = Math.floor(Math.random() * observations.length);
                var random_observation = observations[random_index];
                this.centroids.push(random_observation);
            }
            // Create clusters from the centroids.
            var clusters = this.centroids.map(function (c) {
                return new Cluster(c);
            });
            var step = 0;
            while (step < steps) {
                // Clear all the observations from the clusters.
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = clusters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var c = _step.value;

                        c.clear_observations();
                    }
                    // Place each observation in the cluster with the closest centroid.
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    var _loop = function _loop() {
                        var o = _step2.value;

                        clusters.reduce(function (prev, curr) {
                            return prev.distance(o) < curr.distance(o) ? prev : curr;
                        }).add_observation(o);
                    };

                    for (var _iterator2 = observations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _loop();
                    }
                    // Recalculate the centroid for each cluster.
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = clusters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _c = _step3.value;

                        _c.set_centroid();
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                step += 1;
            }
            // Make each cluster centroid a kmeans centroid.
            this.centroids = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = clusters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _c2 = _step4.value;

                    this.centroids.push(_c2.centroid);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: "predict",
        value: function predict(observation) {
            return this.centroids.reduce(function (prev, curr) {
                return _distance(prev, observation) < _distance(curr, observation) ? prev : curr;
            });
        }
    }]);

    return Kmeans;
}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _js_kmeans_painter = __webpack_require__(0);

var _rs_kmeans_painter = __webpack_require__(1);

/* global Module */
var js_img = new Image();
js_img.src = "test.png";
js_img.onload = function () {
    setup_painter(this, "js", "js_canvas", "js_button", _js_kmeans_painter.JsKmeansPainter);
};
var rs_img = new Image();
rs_img.src = "test.png";
rs_img.onload = function () {
    setup_painter(this, "rs", "rs_canvas", "rs_button", _rs_kmeans_painter.RsKmeansPainter);
};

var setup_painter = function setup_painter(img, msg, canvas_id, button_id, painter_class) {
    /* Setup arrays. */
    var byte_count = img.width * img.height * 4;
    var img_ptr = Module._malloc(byte_count);
    var img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
    /* Get the images starting data. */
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    ctx.drawImage(img, 0, 0);
    img.style.display = "none";
    var image_data = ctx.getImageData(0, 0, width, height);
    /* Copy data into new array. */
    for (var i = 0; i < byte_count; i++) {
        img_array[i] = image_data.data[i];
    }
    image_data = new ImageData(img_array, width, height);

    var paint = function paint() {
        var k = document.getElementById("kRange").value;
        var steps = document.getElementById("stepsRange").value;
        var painter = new painter_class(k, img_ptr, byte_count);
        /* !!!! We may now have a new heap. !!!! */
        img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
        image_data = new ImageData(img_array, width, height);
        var t0 = performance.now();
        console.log("Start: " + msg + " with k=" + k + " and steps=" + steps + ".");
        painter.step(steps);
        /* !!!! We may now have a new heap. !!!! */
        if (msg === "rs") {
            img_array = new Uint8ClampedArray(Module.HEAPU8.buffer, img_ptr, byte_count);
            image_data = new ImageData(img_array, width, height);
        }
        ctx.putImageData(image_data, 0, 0);
        var t1 = performance.now();
        console.log(msg + ": " + Math.round(t1 - t0) + "ms");
    };

    var button = document.getElementById(button_id);
    button.addEventListener("click", paint);
};

window.onload = function () {
    var race_button = document.getElementById("race_button");
    var rs_button = document.getElementById("rs_button");
    var js_button = document.getElementById("js_button");
    race_button.addEventListener("click", function () {
        js_button.click();
        rs_button.click();
    });
};

/***/ })
/******/ ]);