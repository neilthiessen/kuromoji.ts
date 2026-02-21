"use strict";

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import gulp from "gulp";
// const { task, dest, watch, src } = gulp;
import { deleteAsync as del } from "del";
import sequence from "run-sequence";
import eventstream from "event-stream";
const { merge } = eventstream;
import jshint from "gulp-jshint";
const _reporter = jshint.reporter;
import browserify from "browserify";
import source from "vinyl-source-stream";
import gzip from "gulp-gzip";
import mocha from "gulp-mocha";
import istanbul from "gulp-istanbul";
const { hookRequire, writeReports } = istanbul;
import webserver from "gulp-webserver";
import jsdoc from "gulp-jsdoc3";
import bower from "gulp-bower";
// import ghPages from 'gulp-gh-pages-will';
import bump from "gulp-bump";
// const argv = import('minimist')(process.argv.slice(2));
import gulpgit from "gulp-git";
const { add, commit, tag } = gulpgit;

// task("clean", (done) => {
//     return del([
//         ".publish/",
//         "coverage/",
//         "build/",
//         "publish/"
//     ], done);
// });

export function build() {
  console.log("Building...");
  return browserify({
    entries: ["src/kuromoji.js"],
    standalone: "kuromoji", // window.kuromoji
  })
    .transform("babelify", { presets: ["@babel/preset-env"] })
    .bundle()
    .pipe(source("kuromoji.js"))
    .pipe(gulp.dest("build/"));
}

// task("build", [ "clean" ], () => {
//     console.log("Building...");
//     return browserify({
//         entries: [ "src/kuromoji.js" ],
//         standalone: "kuromoji" // window.kuromoji
//     })
//         .bundle()
//         .pipe(source("kuromoji.js"))
//         .pipe(dest("build/"));
// });

// task("watch", () => {
//     watch([ "src/**/*.js", "test/**/*.js" ], [ "lint", "build", "jsdoc" ]);
// });

// task("clean-dict", (done) => {
//     return del([ "dict/" ], done);
// });

// task("create-dat-files", (done) => {
//     const IPADic = import('mecab-ipadic-seed');
//     const kuromoji = import("./src/kuromoji.js");

//     if (!existsSync("dict/")) {
//         mkdirSync("dict/");
//     }

//     // To node.js Buffer
//     function toBuffer (typed) {
//         var ab = typed.buffer;
//         var buffer = new Buffer(ab.byteLength);
//         var view = new Uint8Array(ab);
//         for (var i = 0; i < buffer.length; ++i) {
//             buffer[i] = view[i];
//         }
//         return buffer;
//     }

//     const dic = new IPADic();
//     const builder = kuromoji.dictionaryBuilder();

//     // Build token info dictionary
//     const tokenInfoPromise = dic.readTokenInfo((line) => {
//         builder.addTokenInfoDictionary(line);
//     }).then(() => {
//         console.log('Finishied to read token info dics');
//     });

//     // Build connection costs matrix
//     const matrixDefPromise = dic.readMatrixDef((line) => {
//         builder.putCostMatrixLine(line);
//     }).then(() => {
//         console.log('Finishied to read matrix.def');
//     });

//     // Build unknown dictionary
//     const unkDefPromise = dic.readUnkDef((line) => {
//         builder.putUnkDefLine(line);
//     }).then(() => {
//         console.log('Finishied to read unk.def');
//     });

//     // Build character definition dictionary
//     const charDefPromise = dic.readCharDef((line) => {
//         builder.putCharDefLine(line);
//     }).then(() => {
//         console.log('Finishied to read char.def');
//     });

//     // Build kuromoji.js binary dictionary
//     Promise.all([ tokenInfoPromise, matrixDefPromise, unkDefPromise, charDefPromise ]).then(() => {
//         console.log('Finishied to read all seed dictionary files');
//         console.log('Building binary dictionary ...');
//         return builder.build();
//     }).then((dic) => {
//         const base_buffer = toBuffer(dic.trie.bc.getBaseBuffer());
//         const check_buffer = toBuffer(dic.trie.bc.getCheckBuffer());
//         const token_info_buffer = toBuffer(dic.token_info_dictionary.dictionary.buffer);
//         const tid_pos_buffer = toBuffer(dic.token_info_dictionary.pos_buffer.buffer);
//         const tid_map_buffer = toBuffer(dic.token_info_dictionary.targetMapToBuffer());
//         const connection_costs_buffer = toBuffer(dic.connection_costs.buffer);
//         const unk_buffer = toBuffer(dic.unknown_dictionary.dictionary.buffer);
//         const unk_pos_buffer = toBuffer(dic.unknown_dictionary.pos_buffer.buffer);
//         const unk_map_buffer = toBuffer(dic.unknown_dictionary.targetMapToBuffer());
//         const char_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.character_category_map);
//         const char_compat_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.compatible_category_map);
//         const invoke_definition_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.invoke_definition_map.toBuffer());

//         writeFileSync("dict/base.dat", base_buffer);
//         writeFileSync("dict/check.dat", check_buffer);
//         writeFileSync("dict/tid.dat", token_info_buffer);
//         writeFileSync("dict/tid_pos.dat", tid_pos_buffer);
//         writeFileSync("dict/tid_map.dat", tid_map_buffer);
//         writeFileSync("dict/cc.dat", connection_costs_buffer);
//         writeFileSync("dict/unk.dat", unk_buffer);
//         writeFileSync("dict/unk_pos.dat", unk_pos_buffer);
//         writeFileSync("dict/unk_map.dat", unk_map_buffer);
//         writeFileSync("dict/unk_char.dat", char_map_buffer);
//         writeFileSync("dict/unk_compat.dat", char_compat_map_buffer);
//         writeFileSync("dict/unk_invoke.dat", invoke_definition_map_buffer);

//         done();
//     });
// });

// task("compress-dict", () => {
//     return src("dict/*.dat")
//         .pipe(gzip())
//         .pipe(dest("dict/"));
// });

// task("clean-dat-files", (done) => {
//     return del([ "dict/*.dat" ], done);
// });

// task("build-dict", [ "build", "clean-dict" ], () => {
//     sequence("create-dat-files", "compress-dict", "clean-dat-files");
// });

// task("test", [ "build" ], () => {
//     return src("test/**/*.js", { read: false })
//         .pipe(mocha({ reporter: "list" }));
// });

// task("coverage", [ "test" ], (done) => {
//     src([ "src/**/*.js" ])
//         .pipe(istanbul())
//         .pipe(hookRequire())
//         .on("finish", () => {
//             src([ "test/**/*.js" ])
//                 .pipe(mocha({ reporter: "mocha-lcov-reporter" }))
//                 .pipe(writeReports())
//                 .on("end", done);
//         });
// });

// task("lint", () => {
//     return src([ "src/**/*.js" ])
//         .pipe(jshint())
//         .pipe(_reporter("default"));
// });

// task("clean-jsdoc", (done) => {
//     return del([ "publish/jsdoc/" ], done);
// });

// task("jsdoc", [ "clean-jsdoc" ], (cb) => {
//     var config = import('./jsdoc.json');
//     src([ "src/**/*.js" ], {read: false})
//         .pipe(jsdoc(config, cb));
// });

// task("clean-demo", (done) => {
//     return del([ "publish/demo/" ], done);
// });

// task("copy-demo", [ "clean-demo", "build" ], () => {
//     return merge(
//         src('demo/**/*')
//             .pipe(dest('publish/demo/')),
//         src('build/**/*')
//             .pipe(dest('publish/demo/kuromoji/build/')),
//         src('dict/**/*')
//             .pipe(dest('publish/demo/kuromoji/dict/')));
// });

// task("build-demo", [ "copy-demo" ], () => {
//     return bower({ cwd: 'publish/demo/' });
// });

// task("webserver", [ "build-demo", "jsdoc" ], () => {
//     src("publish/")
//         .pipe(webserver({
//             port: 8000,
//             livereload: true,
//             directoryListing: true
//         }));
// });

// task("deploy", [ "build-demo", "jsdoc" ], () => {
//     return src('publish/**/*')
//         .pipe(ghPages());
// });

// task("version", function () {
//     let type = 'patch';
//     if (argv['minor']) {
//         type = 'minor';
//     }
//     if (argv['major']) {
//         type = 'major';
//     }
//     if (argv['prerelease']) {
//         type = 'prerelease';
//     }
//     return src([ './bower.json', './package.json' ])
//         .pipe(bump({ type: type }))
//         .pipe(dest('./'));
// });

// task("release-commit", function () {
//     var version = JSON.parse(readFileSync('./package.json', 'utf8')).version;
//     return src('.')
//         .pipe(add())
//         .pipe(commit(`chore: release ${version}`));
// });

// task("release-tag", function (callback) {
//     var version = JSON.parse(readFileSync('./package.json', 'utf8')).version;
//     tag(version, `${version} release`, function (error) {
//         if (error) {
//             return callback(error);
//         }
//         callback();
//     });
// });

// task("release", [ "test" ], () => {
//     sequence("release-commit", "release-tag");
// });
