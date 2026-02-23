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

// @ts-expect-error no typings
import doublearray from "doublearray";
const { builder }: { builder: any } = doublearray;

import { DoubleArray, DoubleArrayBuilder, UserDictionaryEntry } from "../types";

/**
 * UserDictionary
 * @constructor
 */
class UserDictionary {
  trie: DoubleArray;
  target_map: Record<number, number[]>;
  features: Record<number, string[]>;
  word_cost: Record<number, number>;

  constructor() {
    this.trie = builder(0).build([{ k: "", v: 1 }]);
    this.target_map = {}; // trie_id -> token_info_id
    this.features = {}; // token_info_id -> features
    this.word_cost = {}; // token_info_id -> word_cost
  }

  buildDictionary(entries: UserDictionaryEntry[]) {
    this.target_map = {};
    this.features = {};
    this.word_cost = {};

    // Default low word cost (negative) so Viterbi favors user words over splitting them
    const DEFAULT_USER_COST = -100000;

    let token_info_id_counter = 0;
    const words: { k: string; v: number }[] = [];
    let trie_id = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const surface_form = entry.surface_form;

      words.push({ k: surface_form, v: trie_id });

      const token_info_id = ++token_info_id_counter;
      if (!this.target_map[trie_id]) {
        this.target_map[trie_id] = [];
      }
      this.target_map[trie_id].push(token_info_id);

      this.word_cost[token_info_id] = entry.word_cost ?? DEFAULT_USER_COST;

      this.features[token_info_id] = [
        surface_form,
        entry.pos,
        entry.pos_detail_1 || "*",
        entry.pos_detail_2 || "*",
        entry.pos_detail_3 || "*",
        entry.conjugated_type || "*",
        entry.conjugated_form || "*",
        entry.basic_form || surface_form,
        entry.reading || "*",
        entry.pronunciation || entry.reading || "*",
      ];

      trie_id++;
    }

    if (words.length > 0) {
      const trieBuilder: DoubleArrayBuilder = builder(1024 * 1024);
      this.trie = trieBuilder.build(words);
    } else {
      this.trie = builder(0).build([{ k: "", v: 1 }]);
    }
  }

  /**
   * Look up features in the dictionary
   * @param {string} token_info_id_str Word ID to look up
   * @returns {string} Features string concatenated by ","
   */
  getFeatures(token_info_id_str: string): string {
    const token_info_id = parseInt(token_info_id_str);
    if (isNaN(token_info_id)) {
      return "";
    }
    const featureArray = this.features[token_info_id];
    if (!featureArray) return "";
    return featureArray.join(",");
  }
}

export default UserDictionary;
