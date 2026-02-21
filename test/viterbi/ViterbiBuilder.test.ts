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

import { beforeEach, describe, expect, test } from "vitest";
import NodeDictionaryLoader from "../../src/loader/NodeDictionaryLoader";
import ViterbiBuilder from "../../src/viterbi/ViterbiBuilder";
import DynamicDictionaries from "../../src/dict/DynamicDictionaries";

var DIC_DIR = "dict/";

describe("ViterbiBuilder", () => {
  let dic: DynamicDictionaries | null = null;
  let viterbi_builder: ViterbiBuilder;
  beforeEach(async () => {
    if (!dic) {
      const loader = new NodeDictionaryLoader(DIC_DIR);
      dic = await loader.asyncLoad();
    }
    console.log("dic loaded");
    viterbi_builder = new ViterbiBuilder(dic);
    console.log("viterbi_builder created");
  });
  test("Unknown word", function () {
    // lattice to have "ト", "トト", "トトロ"
    var lattice = viterbi_builder.build("トトロ");
    for (var i = 1; i < lattice.eos_pos; i++) {
      var nodes = lattice.nodes_end_at[i];
      if (nodes == null) {
        continue;
      }
      expect(
        nodes.map(function (node) {
          return node.surface_form;
        }),
      ).to.include("トトロ".slice(0, i));
    }
  });
});
