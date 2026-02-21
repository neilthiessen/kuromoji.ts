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

import TokenizerBuilder from "./TokenizerBuilder.js";
import DictionaryBuilder from "./dict/builder/DictionaryBuilder.js";
import { TokenizerBuilderOptions } from "./types";
import { IpadicFeatures as IpadicFeaturesType } from "./types";

// Public methods
export const kuromoji = {
  builder: function (options: TokenizerBuilderOptions) {
    console.log("new builder called with option: ", options);
    // if (options.useWorker) {
    //   console.log("use worker");
    //   return new WorkerTokenizerBuilder(options);
    // }
    return new TokenizerBuilder(options);
  },
  dictionaryBuilder: function () {
    return new DictionaryBuilder();
  },
};

export type IpadicFeatures = IpadicFeaturesType;
