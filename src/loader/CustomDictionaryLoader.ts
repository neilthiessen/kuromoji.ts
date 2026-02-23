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

// import { gunzip } from "zlib";
import { LoaderInternalCallback, CustomReadFileFunc } from "../types";
import DictionaryLoader from "./DictionaryLoader";

class CustomDictionaryLoader extends DictionaryLoader {
  readFile: CustomReadFileFunc;
  constructor(readFileFunc: CustomReadFileFunc, dic_path?: string) {
    super(dic_path);
    this.readFile = readFileFunc;
    this.loadArrayBuffer = this.loadArrayBuffer.bind(this);
  }

  loadArrayBuffer(file: string, callback: LoaderInternalCallback) {
    // console.log("loading file: ", file);
    this.readFile(file)
      .then((buffer) => {
        let ds = new DecompressionStream("gzip");
        const blob = new Blob([buffer]);
        let decompressedStream = blob.stream().pipeThrough(ds);
        new Response(decompressedStream)
          .arrayBuffer()
          .then((decompressedBuffer) => {
            var typed_array = new Uint8Array(decompressedBuffer);
            callback(null, typed_array.buffer);
          });
      })
      .catch((err) => {
        console.error(err);
        callback(err);
      });
  }
  async asyncLoadArrayBuffer(file: string): Promise<ArrayBuffer> {
    // console.log("loading file: ", file);
    // console.log("this is ", this);
    if (!this.readFile) {
      throw new Error("readFile function is not defined");
    }
    try {
      const buffer = await this.readFile(file);
      let ds = new DecompressionStream("gzip");
      const blob = new Blob([buffer]);
      let decompressedStream = blob.stream().pipeThrough(ds);
      const decompressedBuffer = await new Response(
        decompressedStream,
      ).arrayBuffer();
      var typed_array = new Uint8Array(decompressedBuffer);
      // console.log(`${file} loaded, len is ${typed_array.length}`);
      return typed_array.buffer;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export default CustomDictionaryLoader;
