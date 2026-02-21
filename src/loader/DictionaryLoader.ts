/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import DynamicDictionaries from "../dict/DynamicDictionaries.js";
import {
  BufferPack,
  TauriReadFileFunc,
  TokenizerBuilderOptions,
} from "../types";
import { FILE_NAMES } from "../types.js";

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @param {function} readFileFunc Function to read file
 * @constructor
 */
class DictionaryLoader {
  dic: DynamicDictionaries;
  dic_path: string;
  readFileFunc: TauriReadFileFunc | undefined;
  constructor(dic_path?: string, readFileFunc?: TauriReadFileFunc) {
    // console.log("DictionaryLoader constructor");
    this.dic = new DynamicDictionaries();
    this.dic_path = dic_path ?? "";
    this.readFileFunc = readFileFunc;
  }
  // loadArrayBuffer(file: string, callback: LoaderInternalCallback) {
  //     throw new Error("DictionaryLoader#loadArrayBuffer should be overwrite");
  // }
  async asyncLoadArrayBuffer(file: string): Promise<ArrayBuffer> {
    throw new Error("DictionaryLoader#loadArrayBuffer should be overwrite");
  }

  async prepareBuffers(): Promise<BufferPack> {
    var dic_path = this.dic_path;
    var asyncLoadArrayBuffer = this.asyncLoadArrayBuffer.bind(this);
    const allBuffers: BufferPack = {} as BufferPack;
    var dic_path_url = function (filename: string) {
      // TODO: platform check?
      var separator = "/";
      // var replace = new RegExp(separator + '{1,}', 'g');
      // console.log('before replace: ', [dic_path, filename].join(separator))
      // var path = [dic_path, filename].join(separator).replace(replace, separator);
      // console.log('after replace: ', path)
      var path = [dic_path, filename].join(separator);
      return path;
    };

    await Promise.all([
      // Trie
      (async function () {
        await Promise.all(
          [FILE_NAMES.base, FILE_NAMES.check].map(async function ({
            fileName,
            bufferKey,
          }) {
            allBuffers[bufferKey] = await asyncLoadArrayBuffer(
              dic_path_url(fileName),
            );
          }),
        );
        return;
      })(),
      // Token info dictionaries
      (async function () {
        await Promise.all(
          [FILE_NAMES.tid, FILE_NAMES.tid_pos, FILE_NAMES.tid_map].map(
            async function ({ fileName, bufferKey }) {
              allBuffers[bufferKey] = await asyncLoadArrayBuffer(
                dic_path_url(fileName),
              );
            },
          ),
        );
        // var token_info_buffer = new Uint8Array(buffers[0]);
        // var pos_buffer = new Uint8Array(buffers[1]);
        // var target_map_buffer = new Uint8Array(buffers[2]);

        // dic.loadTokenInfoDictionaries(
        //   token_info_buffer,
        //   pos_buffer,
        //   target_map_buffer,
        // );
        return;
      })(),
      // Connection cost matrix
      (async function () {
        await Promise.all(
          [FILE_NAMES.cc].map(async function ({ fileName, bufferKey }) {
            allBuffers[bufferKey] = await asyncLoadArrayBuffer(
              dic_path_url(fileName),
            );
          }),
        );
        // var cc_buffer = new Int16Array(buffers[0]);
        // dic.loadConnectionCosts(cc_buffer);
        return;
      })(),
      // Unknown word dictionary
      (async function () {
        await Promise.all(
          [
            FILE_NAMES.unk,
            FILE_NAMES.unk_pos,
            FILE_NAMES.unk_map,
            FILE_NAMES.unk_char,
            FILE_NAMES.unk_compat,
            FILE_NAMES.unk_invoke,
          ].map(async function ({ fileName, bufferKey }) {
            allBuffers[bufferKey] = await asyncLoadArrayBuffer(
              dic_path_url(fileName),
            );
          }),
        );
        // var unk_buffer = new Uint8Array(buffers[0]);
        // var unk_pos_buffer = new Uint8Array(buffers[1]);
        // var unk_map_buffer = new Uint8Array(buffers[2]);
        // var cat_map_buffer = new Uint8Array(buffers[3]);
        // var compat_cat_map_buffer = new Uint32Array(buffers[4]);
        // var invoke_def_buffer = new Uint8Array(buffers[5]);
        // dic.loadUnknownDictionaries(
        //   unk_buffer,
        //   unk_pos_buffer,
        //   unk_map_buffer,
        //   cat_map_buffer,
        //   compat_cat_map_buffer,
        //   invoke_def_buffer,
        // );
        return;
      })(),
    ]);

    // console.log("Dictionary loaded.");

    return allBuffers;
  }

  async asyncLoad(): Promise<DynamicDictionaries> {
    var dic = this.dic;
    var dic_path = this.dic_path;
    var asyncLoadArrayBuffer = this.asyncLoadArrayBuffer.bind(this);
    const buffers = {};
    var dic_path_url = function (filename: string) {
      // TODO: platform check?
      var separator = "/";
      // var replace = new RegExp(separator + '{1,}', 'g');
      // console.log('before replace: ', [dic_path, filename].join(separator))
      // var path = [dic_path, filename].join(separator).replace(replace, separator);
      // console.log('after replace: ', path)
      var path = [dic_path, filename].join(separator);
      return path;
    };

    await Promise.all([
      // Trie
      (async function () {
        var buffers = await Promise.all(
          [FILE_NAMES.base, FILE_NAMES.check].map(async function ({
            fileName,
          }) {
            return await asyncLoadArrayBuffer(dic_path_url(fileName));
          }),
        );
        var base_buffer = new Int32Array(buffers[0]);
        var check_buffer = new Int32Array(buffers[1]);
        dic.loadTrie(base_buffer, check_buffer);
        return;
      })(),
      // Token info dictionaries
      (async function () {
        var buffers = await Promise.all(
          [FILE_NAMES.tid, FILE_NAMES.tid_pos, FILE_NAMES.tid_map].map(
            async function ({ fileName }) {
              return await asyncLoadArrayBuffer(dic_path_url(fileName));
            },
          ),
        );
        var token_info_buffer = new Uint8Array(buffers[0]);
        var pos_buffer = new Uint8Array(buffers[1]);
        var target_map_buffer = new Uint8Array(buffers[2]);

        dic.loadTokenInfoDictionaries(
          token_info_buffer,
          pos_buffer,
          target_map_buffer,
        );
        return;
      })(),
      // Connection cost matrix
      (async function () {
        var buffers = await Promise.all(
          [FILE_NAMES.cc].map(async function ({ fileName }) {
            return await asyncLoadArrayBuffer(dic_path_url(fileName));
          }),
        );
        var cc_buffer = new Int16Array(buffers[0]);
        dic.loadConnectionCosts(cc_buffer);
        return;
      })(),
      // Unknown word dictionary
      (async function () {
        var buffers = await Promise.all(
          [
            FILE_NAMES.unk,
            FILE_NAMES.unk_pos,
            FILE_NAMES.unk_map,
            FILE_NAMES.unk_char,
            FILE_NAMES.unk_compat,
            FILE_NAMES.unk_invoke,
          ].map(async function ({ fileName }) {
            return await asyncLoadArrayBuffer(dic_path_url(fileName));
          }),
        );
        var unk_buffer = new Uint8Array(buffers[0]);
        var unk_pos_buffer = new Uint8Array(buffers[1]);
        var unk_map_buffer = new Uint8Array(buffers[2]);
        var cat_map_buffer = new Uint8Array(buffers[3]);
        var compat_cat_map_buffer = new Uint32Array(buffers[4]);
        var invoke_def_buffer = new Uint8Array(buffers[5]);
        dic.loadUnknownDictionaries(
          unk_buffer,
          unk_pos_buffer,
          unk_map_buffer,
          cat_map_buffer,
          compat_cat_map_buffer,
          invoke_def_buffer,
        );
        return;
      })(),
    ]);

    // console.log("Dictionary loaded.");

    return dic;
  }
  // /**
  //  * Load dictionary files
  //  * @param {DictionaryLoader~onLoad} load_callback Callback function called after loaded
  //  */
  // load(load_callback: DictionaryLoaderCallback) {
  //     var dic = this.dic;
  //     var dic_path = this.dic_path;
  //     var loadArrayBuffer = this.loadArrayBuffer;
  //     var dic_path_url = function (filename: string) {
  //         // TODO: platform check?
  //         var separator = '/';
  //         // var replace = new RegExp(separator + '{1,}', 'g');
  //         // console.log('before replace: ', [dic_path, filename].join(separator))
  //         // var path = [dic_path, filename].join(separator).replace(replace, separator);
  //         // console.log('after replace: ', path)
  //         var path = [dic_path, filename].join(separator);
  //         return path;
  //     };

  //     parallel([
  //         // Trie
  //         function (callback: LoaderInternalCallback) {
  //             map(["base.dat.gz.bin", "check.dat.gz.bin"], function (filename: string, _callback: LoaderInternalCallback) {
  //                 loadArrayBuffer(dic_path_url(filename), function (err, buffer) {
  //                     if (err) {
  //                         return _callback(err);
  //                     }
  //                     _callback(null, buffer);
  //                 });
  //             }, function (err: any, buffers: Uint8Array) {
  //                 if (err) {
  //                     return callback(err);
  //                 }
  //                 var base_buffer = new Int32Array(buffers[0]);
  //                 var check_buffer = new Int32Array(buffers[1]);

  //                 dic.loadTrie(base_buffer, check_buffer);
  //                 callback(null);
  //             });
  //         },
  //         // Token info dictionaries
  //         function (callback: LoaderInternalCallback) {
  //             map(["tid.dat.gz.bin", "tid_pos.dat.gz.bin", "tid_map.dat.gz.bin"], function (filename: string, _callback: LoaderInternalCallback) {
  //                 loadArrayBuffer(dic_path_url(filename), function (err, buffer) {
  //                     if (err) {
  //                         return _callback(err);
  //                     }
  //                     _callback(null, buffer);
  //                 });
  //             }, function (err: any, buffers: ArrayBuffer[]) {
  //                 if (err) {
  //                     return callback(err);
  //                 }
  //                 var token_info_buffer = new Uint8Array(buffers[0]);
  //                 var pos_buffer = new Uint8Array(buffers[1]);
  //                 var target_map_buffer = new Uint8Array(buffers[2]);

  //                 dic.loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer);
  //                 callback(null);
  //             });
  //         },
  //         // Connection cost matrix
  //         function (callback: LoaderInternalCallback) {
  //             loadArrayBuffer(dic_path_url("cc.dat.gz.bin"), function (err: any, buffer?: ArrayBuffer | null) {
  //                 if (err || !buffer) {
  //                     return callback(err);
  //                 }
  //                 var cc_buffer = new Int16Array(buffer);
  //                 dic.loadConnectionCosts(cc_buffer);
  //                 callback(null);
  //             });
  //         },
  //         // Unknown dictionaries
  //         function (callback: LoaderInternalCallback) {
  //             map(["unk.dat.gz.bin", "unk_pos.dat.gz.bin", "unk_map.dat.gz.bin", "unk_char.dat.gz.bin", "unk_compat.dat.gz.bin", "unk_invoke.dat.gz.bin"], function (filename: string, _callback: LoaderInternalCallback) {
  //                 loadArrayBuffer(dic_path_url(filename), function (err: any, buffer?: ArrayBuffer | null) {
  //                     if (err) {
  //                         return _callback(err);
  //                     }
  //                     _callback(null, buffer);
  //                 });
  //             }, function (err: any, buffers: ArrayBuffer[]) {
  //                 if (err) {
  //                     return callback(err);
  //                 }
  //                 var unk_buffer = new Uint8Array(buffers[0]);
  //                 var unk_pos_buffer = new Uint8Array(buffers[1]);
  //                 var unk_map_buffer = new Uint8Array(buffers[2]);
  //                 var cat_map_buffer = new Uint8Array(buffers[3]);
  //                 var compat_cat_map_buffer = new Uint32Array(buffers[4]);
  //                 var invoke_def_buffer = new Uint8Array(buffers[5]);

  //                 dic.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
  //                 // dic.loadUnknownDictionaries(char_buffer, unk_buffer);
  //                 callback(null);
  //             });
  //         }
  //     ], function (err: any) {
  //         load_callback(err, dic);
  //     });
  // }
}

// /**
//  * Callback
//  * @callback DictionaryLoader~onLoad
//  * @param {Object} err Error object
//  * @param {DynamicDictionaries} dic Loaded dictionary
//  */

export default DictionaryLoader;
