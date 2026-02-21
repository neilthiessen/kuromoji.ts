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

import ViterbiBuilder from "./viterbi/ViterbiBuilder.js";
import ViterbiSearcher from "./viterbi/ViterbiSearcher.js";
import IpadicFormatter from "./util/IpadicFormatter.js";
import DynamicDictionaries from "./dict/DynamicDictionaries.js";
import TokenInfoDictionary from "./dict/TokenInfoDictionary.js";
import UnknownDictionary from "./dict/UnknownDictionary.js";
import { BaseFeatures, Formatter, IpadicFeatures } from "./types";
import ViterbiLattice from "./viterbi/ViterbiLattice.js";

var PUNCTUATION = /、|。/;

class Tokenizer<T extends IpadicFeatures> {
  token_info_dictionary: TokenInfoDictionary;
  unknown_dictionary: UnknownDictionary;
  viterbi_builder: ViterbiBuilder;
  viterbi_searcher: ViterbiSearcher;
  formatter: Formatter<T>;
  constructor(dic: DynamicDictionaries) {
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
    this.viterbi_builder = new ViterbiBuilder(dic);
    this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
    this.formatter = new IpadicFormatter() as any as Formatter<T>; // TODO Other dictionaries
  }
  /**
   * Split into sentence by punctuation
   */
  static splitByPunctuation(input: string): Array<string> {
    var sentences = [];
    var tail = input;
    while (true) {
      if (tail === "") {
        break;
      }
      var index = tail.search(PUNCTUATION);
      if (index < 0) {
        sentences.push(tail);
        break;
      }
      sentences.push(tail.substring(0, index + 1));
      tail = tail.substring(index + 1);
    }
    return sentences;
  }
  /**
   * Tokenize text
   */
  tokenize(text: string): T[] {
    var sentences = Tokenizer.splitByPunctuation(text);
    var tokens: T[] = [];
    for (var i = 0; i < sentences.length; i++) {
      var sentence = sentences[i];
      this.tokenizeForSentence(sentence, tokens);
    }
    return tokens;
  }
  async asyncTokenize(text: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      resolve(this.tokenize(text));
    });
  }
  tokenizeForSentence(sentence: string, tokens: T[]) {
    if (tokens == null) {
      tokens = [];
    }
    var lattice = this.getLattice(sentence);
    var best_path = this.viterbi_searcher.search(lattice);
    var last_pos = 0;
    if (tokens.length > 0) {
      last_pos = tokens[tokens.length - 1].word_position;
    }

    for (var j = 0; j < best_path.length; j++) {
      var node = best_path[j];

      var token: T, features: string[], features_line: string;
      if (node.type === "KNOWN") {
        features_line = this.token_info_dictionary.getFeatures(node.name);
        if (features_line == null) {
          features = [];
        } else {
          features = features_line.split(",");
        }
        token = this.formatter.formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features,
        );
      } else if (node.type === "UNKNOWN") {
        // Unknown word
        features_line = this.unknown_dictionary.getFeatures(node.name);
        if (features_line == null) {
          features = [];
        } else {
          features = features_line.split(",");
        }
        token = this.formatter.formatUnknownEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features,
          node.surface_form,
        );
      } else {
        // TODO User dictionary
        token = this.formatter.formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          [],
        );
      }

      tokens.push(token);
    }

    return tokens;
  }
  /**
   * Build word lattice
   */
  getLattice(text: string): ViterbiLattice {
    return this.viterbi_builder.build(text);
  }
}

export default Tokenizer;
