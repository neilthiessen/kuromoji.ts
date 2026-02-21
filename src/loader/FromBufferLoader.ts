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

import { BufferPack, FILE_NAMES } from "../types.js";
import DictionaryLoader from "./DictionaryLoader";
import { LoaderInternalCallback } from "../types";

/**
 * BrowserDictionaryLoader inherits DictionaryLoader, using jQuery XHR for download
 * @param {string} dic_path Dictionary path
 * @constructor
 */
class FromBufferLoader extends DictionaryLoader {
  constructor(dic_path: string) {
    super(dic_path);
  }
  /**
   * Utility function to load gzipped dictionary
   * @param {string} url Dictionary URL
   * @param {FromBufferLoader~onLoad} callback Callback function
   */
  loadArrayBuffer(url: string, callback: LoaderInternalCallback) {
    throw new Error("This is a buffer loader. Call loadFromBuffers.");
  }

  async loadFromBuffers(buffers: BufferPack) {
    var dic = this.dic;

    await Promise.all([
      // Trie
      (async function () {
        var base_buffer = new Int32Array(buffers[FILE_NAMES.base.bufferKey]);
        var check_buffer = new Int32Array(buffers[FILE_NAMES.check.bufferKey]);
        dic.loadTrie(base_buffer, check_buffer);
        return;
      })(),
      // Token info dictionaries
      (async function () {
        var token_info_buffer = new Uint8Array(
          buffers[FILE_NAMES.tid.bufferKey],
        );
        var pos_buffer = new Uint8Array(buffers[FILE_NAMES.tid_pos.bufferKey]);
        var target_map_buffer = new Uint8Array(
          buffers[FILE_NAMES.tid_map.bufferKey],
        );

        dic.loadTokenInfoDictionaries(
          token_info_buffer,
          pos_buffer,
          target_map_buffer,
        );
        return;
      })(),
      // Connection cost matrix
      (async function () {
        var cc_buffer = new Int16Array(buffers[FILE_NAMES.cc.bufferKey]);
        dic.loadConnectionCosts(cc_buffer);
        return;
      })(),
      // Unknown word dictionary
      (async function () {
        var unk_buffer = new Uint8Array(buffers[FILE_NAMES.unk.bufferKey]);
        var unk_pos_buffer = new Uint8Array(
          buffers[FILE_NAMES.unk_pos.bufferKey],
        );
        var unk_map_buffer = new Uint8Array(
          buffers[FILE_NAMES.unk_map.bufferKey],
        );
        var cat_map_buffer = new Uint8Array(
          buffers[FILE_NAMES.unk_char.bufferKey],
        );
        var compat_cat_map_buffer = new Uint32Array(
          buffers[FILE_NAMES.unk_compat.bufferKey],
        );
        var invoke_def_buffer = new Uint8Array(
          buffers[FILE_NAMES.unk_invoke.bufferKey],
        );
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
}

export default FromBufferLoader;
