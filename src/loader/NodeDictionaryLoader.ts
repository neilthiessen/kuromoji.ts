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

import fs from "fs/promises";
import zlib from "zlib";
import DictionaryLoader from "./DictionaryLoader";

/**
 * NodeDictionaryLoader inherits DictionaryLoader
 * @param {string} dic_path Dictionary path
 * @constructor
 */
export default class NodeDictionaryLoader extends DictionaryLoader {
  constructor(dic_path: string) {
    super(dic_path);
  }

  async asyncLoadArrayBuffer(file: string) {
    // console.log("Loading dictionary: " + file);
    const buffer = await fs.readFile(file);
    const decompressed: Buffer = await new Promise((resolve, reject) => {
      zlib.gunzip(buffer, (err, decompressed) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decompressed);
      });
    });
    // console.log(`Loaded dictionary: ${file} (${decompressed.length} bytes`);
    return new Uint8Array(decompressed).buffer;
  }
}
