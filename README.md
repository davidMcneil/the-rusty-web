# The Rusty Web

[![Website](https://img.shields.io/badge/website-The_Rusty_Web-red.svg)](https://davidmcneil.github.io/the-rusty-web/)
[![Guide](https://img.shields.io/badge/guide-GitBook-blue.svg)](https://davidmcneil.gitbooks.io/the-rusty-web/content/)

## About
This project demonstrates a complete, albeit simple, example of integrating
[Rust](https://www.rust-lang.org) code into a web application. This is accomplished by compiling
Rust to [asm.js](http://asmjs.org/) or [WebAssembly](http://webassembly.org/). The
basic design pattern this project explores uses Rust to implement CPU bound portions of an app while
using existing web technologies to handle user facing, I/O bound pieces. The
[guide](https://davidmcneil.gitbooks.io/the-rusty-web/content/) explores this design pattern in
detail.

The project compares implementations of the
[k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) algorithm (this example's
CPU bound task) applied to an image. The algorithm gives the resulting image a softened, painted look.

## Setup

### Dependencies
See the [guide](https://davidmcneil.gitbooks.io/the-rusty-web/content/setup-and-hello-world.html) 
for steps on installing the dependencies.
* [Rust](https://www.rust-lang.org)
* [Node](https://nodejs.org)
* [Emscripten](http://emscripten.org)

### Running the Project Natively
From the top level of the project run
> cargo run

or
> cargo run --release

The resulting painted image can be found at *img/out.jpg*.

### Running on the Web
From the top level of the project...

Build the asm.js version
> cargo build --release --target asmjs-unknown-emscripten

Build the WebAssembly version
> cargo build --release --target wasm32-unknown-emscripten

From the *website/* directory...

Install node dependencies
> npm install

Build the website (build results can be found in *website/dist*)
> npm run build

or build the website in release mode
> npm run build-release

or start a web server, website is served at [http://localhost:9000/](http://localhost:9000/)
> npm run start
