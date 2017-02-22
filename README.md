# The Rusty Web
---------------

[Website](https://davidmcneil.github.io/the-rusty-web/)

[Guide](https://davidmcneil.gitbooks.io/the-rusty-web/content/)

## About
This project demonstrates a complete, albeit simple, example of integrating
[Rust](https://www.rust-lang.org) code into a web application. This is accomplished by compiling
Rust to [asm.js](http://asmjs.org/) or [WebAssembly](http://webassembly.org/). The
basic design pattern this site explores uses Rust to implement CPU bound portions of an app while
using existing web technologies to handle user facing I/O bound pieces. The
[guide](https://davidmcneil.gitbooks.io/the-rusty-web/content/) explores this design pattern in
detail.

The project compares implementations of the
[k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) algorithm (this example's
CPU bound task) applied to an image. The algorithm gives the resulting image a softened, painted look.

## Setup
This will only hit the highlights see the [guide](https://davidmcneil.gitbooks.io/the-rusty-web/content/) 
for a detailed description of how to setup the project.

### Dependencies
* Rust
* Node
* Emscripten

### Running the Project Natively
From the top level of the project run
> cargo run

or
> cargo run --release

you should now be able to see the resulting image at 'img/out.jpg'.

### Running on the Web
From the top level of the project...

Build the asm.js version
> cargo build --release --target asmjs-unknown-emscripten

Build the WebAssembly version
> cargo build --target wasm32-unknown-emscripten

From the 'website' directory...

Install node dependencies
> npm install

Build the website, build results can be found in the 'website/dist'
> npm run build

or build the website in release mode, build results can be found in the 'website/dist'
> npm run build-release

or start a web server, website is served at [http://localhost:9000/](http://localhost:9000/)
> npm run start
