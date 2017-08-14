var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var os = require('os');
var dts = require('dts-bundle');
var deleteEmpty = require('delete-empty');

/* helper function to get into build directory */
var libPath = function(name) {
	if ( undefined === name ) {
		return 'dist';
	}

	return path.join('dist', name);
}

/* helper to clean leftovers */
var outputCleanup = function(dir, initial) {
	if (false == fs.existsSync(libPath())){
		return;
	}

	if ( true == initial ) {
		console.log("Build leftover found, cleans it up.");
	}

	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);

		if(filename == "." || filename == "..") {
			// pass these files
			} else if(stat.isDirectory()) {
				// outputCleanup recursively
				outputCleanup(filename, false);
			} else {
				// rm fiilename
				fs.unlinkSync(filename);
			}
	}
	fs.rmdirSync(dir);
};

/* precentage handler is used to hook build start and ending */
var percentage_handler = function handler(percentage, msg) {
	if ( 0 == percentage ) {
		/* Build Started */
		outputCleanup(libPath(), true);
		console.log("Build started... Good luck!");
	} else if ( 1 == percentage ) {
		// TODO: No Error detection. :(
		create_browser_version(webpack_opts.output.filename);

		// Invokes dts bundling
		console.log("Bundling d.ts files ...");
		dts.bundle(bundle_opts);

		// Invokes lib/ cleanup
		deleteEmpty(bundle_opts.baseDir, function(err, deleted) {
			if ( err ) {
				console.error("Couldn't clean up : " + err);
				throw err;
			} else {
				console.log("Cleanup " + deleted);
			}
		});
	}
}

var bundle_opts = {

	// Required

	// name of module likein package.json
	// - used to declare module & import/require
	name: 'ts-library-starter',
	// path to entry-point (generated .d.ts file for main module)
	// if you want to load all .d.ts files from a path recursively you can use "path/project/**/*.d.ts"
	//  ^ *** Experimental, TEST NEEDED, see "All .d.ts files" section
	// - either relative or absolute
	main: 'src/main.d.ts',

	// Optional

	// base directory to be used for discovering type declarations (i.e. from this project itself)
	// - default: dirname of main
	baseDir: 'src',
	// path of output file. Is relative from baseDir but you can use absolute paths.
	// if starts with "~/" then is relative to current path. See https://github.com/TypeStrong/dts-bundle/issues/26
	//  ^ *** Experimental, TEST NEEDED
	// - default: "<baseDir>/<name>.d.ts"
	out: '../dist/main.d.ts',
	// include typings outside of the 'baseDir' (i.e. like node.d.ts)
	// - default: false
	externals: false,
	// reference external modules as <reference path="..." /> tags *** Experimental, TEST NEEDED
	// - default: false
	referenceExternals: false,
	// filter to exclude typings, either a RegExp or a callback. match path relative to opts.baseDir
	// - RegExp: a match excludes the file
	// - function: (file:String, external:Boolean) return true to exclude, false to allow
	// - always use forward-slashes (even on Windows)
	// - default: *pass*
	exclude: /^defs\/$/,
	// delete all source typings (i.e. "<baseDir>/**/*.d.ts")
	// - default: false
	removeSource: true,
	// newline to use in output file
	newline: os.EOL,
	// indentation to use in output file
	// - default 4 spaces
	indent: '	',
	// prefix for rewriting module names
	// - default ''
	prefix: '',
	// separator for rewriting module 'path' names
	// - default: forward slash (like sub-modules)
	separator: '/',
	// enable verbose mode, prints detailed info about all references and includes/excludes
	// - default: false
	verbose: false,
	// emit although included files not found. See "Files not found" section.
	// *** Experimental, TEST NEEDED
	// - default: false
	emitOnIncludedFileNotFound: false,
	// emit although no included files not found. See "Files not found" section.
	// *** Experimental, TEST NEEDED
	// - default: false
	emitOnNoIncludedFileNotFound: false,
	// output d.ts as designed for module folder. (no declare modules)
	outputAsModuleFolder: false
};

var webpack_opts = {
	entry: './src/main.ts',
	target: 'node',
	output: {
		filename: libPath('main.js'),
		libraryTarget: "commonjs2"
	},
	resolve: {
		extensions: ['', '.ts', '.js'],
		modules: [
			'node_modules',
			'src',
		]
	},
	module: {
		preLoaders: [{ test: /\.ts$/, loaders: ['tslint'] }],
		loaders: [{ test: /\.ts$/, loaders: ['babel-loader', 'awesome-typescript-loader'] }]
	},
	externals: [nodeExternals()],
	plugins: [
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.ProgressPlugin(percentage_handler)
	],
	tslint: {
		emitErrors: true,
		failOnHint: true
	}
}

var create_browser_version = function (inputJs) {
	let outputName = inputJs.replace(/\.[^/.]+$/, "");
	outputName = `${outputName}.browser.js`;
	console.log("Creating browser version ...");

	let b = browserify(inputJs, {
		standalone: bundle_opts.name,
	});

	b.bundle(function(err, src) {
		if ( err != null ) {
			console.error("Browserify error:");
			console.error(err);
		}
	}).pipe(fs.createWriteStream(outputName));
}

module.exports = webpack_opts;
