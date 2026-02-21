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

import DictionaryLoader from "./loader/DictionaryLoader";
import NodeDictionaryLoader from "./loader/NodeDictionaryLoader";
import TauriDictionaryLoader from "./loader/TauriDictionaryLoader";
import BrowserDictionaryLoader from "./loader/BrowserDictionaryLoader";

import Tokenizer from "./Tokenizer.js";
// import DictionaryLoader from "./loader/TauriDictionaryLoader.js";
import type {
  BufferPack,
  IpadicFeatures,
  TauriReadFileFunc,
  TokenizerBuilderOptions,
} from "./types";
import FromBufferLoader from "./loader/FromBufferLoader";

class TokenizerBuilder<T extends IpadicFeatures> {
  /**
   * TokenizerBuilder create Tokenizer instance.
   * @param {Object} option JSON object which have key-value pairs settings
   * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
   * @param {function} option.readFileFunc Function to read file (or get file using in browser)
   * @constructor
   */
  dic_path: string;
  // readFileFunc: TokenizerBuilderOptions["readFileFunc"] | null;
  loader: DictionaryLoader | null;
  loadMethod: TokenizerBuilderOptions["loadMethod"];
  constructor(option: TokenizerBuilderOptions) {
    if (!("dicPath" in option) || option.dicPath == null) {
      this.dic_path = "dict/";
    } else {
      this.dic_path = option.dicPath;
    }
    this.loader = null;
    this.loadMethod = option.loadMethod;
    if (this.loadMethod === "fs") {
      this.loader = new NodeDictionaryLoader(this.dic_path);
    } else if (option.loadMethod === "tauri") {
      this.loader = new TauriDictionaryLoader(
        option.readFileFunc,
        this.dic_path,
      );
    } else if (this.loadMethod === "fetch") {
      this.loader = new BrowserDictionaryLoader(this.dic_path);
    } else if (this.loadMethod === "from_buffers") {
      this.loader = new FromBufferLoader(this.dic_path);
    }
    if (!this.loader) {
      throw new Error("Invalid loadMethod");
    }
  }
  // /**
  //  * Build Tokenizer instance by asynchronous manner
  //  * @param {TokenizerBuilder~onLoad} callback Callback function
  //  */
  // build(callback: (err: Error, tokenizer: Tokenizer<T> | null) => void) {
  //     var loader = new DictionaryLoader(this.readFileFunc, this.dic_path);
  //     loader.load(function (err, dic) {
  //         if (err) {
  //             callback(err, null);
  //             return;
  //         }
  //         if (dic == null) {
  //             callback(new Error("Dictionary is null"), null);
  //             return;
  //         }
  //         callback(err, new Tokenizer<T>(dic));
  //     });
  // }
  async asyncBuild(): Promise<Tokenizer<T>> {
    // var loader = new DictionaryLoader(this.readFileFunc, this.dic_path);
    if (!this.loader) {
      throw new Error("Loader is not initialized");
    }
    if (this.loadMethod === "from_buffers") {
      throw new Error("Cannot use asyncBuild with from_buffers loadMethod");
    }
    var dic = await this.loader.asyncLoad();

    return new Tokenizer<T>(dic);
  }

  async prepareBuffers(): Promise<BufferPack> {
    if (!this.loader) {
      throw new Error("Loader is not initialized");
    }
    return this.loader.prepareBuffers();
  }

  async buildFromBuffers(buffers: BufferPack): Promise<Tokenizer<T>> {
    if (!this.loader) {
      throw new Error("Loader is not initialized");
    }
    if (
      this.loadMethod !== "from_buffers" ||
      !(this.loader instanceof FromBufferLoader)
    ) {
      throw new Error(
        "Cannot use buildFromBuffers with non from_buffers loadMethod",
      );
    }
    let dic = await this.loader.loadFromBuffers(buffers);
    return new Tokenizer<T>(dic);
  }
}

/**
 * Callback used by build
 * @callback TokenizerBuilder~onLoad
 * @param {Object} err Error object
 * @param {Tokenizer} tokenizer Prepared Tokenizer
 */

export default TokenizerBuilder;
