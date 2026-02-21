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

import { describe, expect, test, beforeAll } from "vitest";
import NodeDictionaryLoader from "../../src/loader/NodeDictionaryLoader";
import DynamicDictionaries from "../../src/dict/DynamicDictionaries";

var DIC_DIR = "dict/";

describe("DictionaryLoader", function () {
  let dictionaries: DynamicDictionaries; // target object

  beforeAll(async function () {
    var loader = new NodeDictionaryLoader(DIC_DIR);
    dictionaries = await loader.asyncLoad();
  });

  test("Unknown dictionaries are loaded properly", function () {
    expect(dictionaries.unknown_dictionary.lookup(" ")).toEqual({
      class_id: 1,
      class_name: "SPACE",
      is_always_invoke: 0,
      is_grouping: 1,
      max_length: 0,
    });
  });
  test("TokenInfoDictionary is loaded properly", function () {
    expect(
      dictionaries.token_info_dictionary.getFeatures("0"),
    ).to.have.length.above(1);
  });
});

describe("DictionaryLoader about loading", function () {
  test("could load directory path without suffix /", async function () {
    let dic = new NodeDictionaryLoader("dict").asyncLoad(); // not have suffix /
    expect(dic).to.not.be.undefined;
  });
  test("couldn't load dictionary, then call with error", async function () {
    var loader = new NodeDictionaryLoader("non-exist/dictionaries");
    try {
      await loader.asyncLoad();
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
    }
  });
});
