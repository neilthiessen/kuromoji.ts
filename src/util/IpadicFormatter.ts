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

import { Formatter, IpadicFeatures } from "../types";

/**
 * Mappings between IPADIC dictionary features and tokenized results
 */
class IpadicFormatter implements Formatter<IpadicFeatures> {
  constructor() {}
  formatEntry(
    word_id: number,
    position: number,
    type: string,
    features: string[],
  ): IpadicFeatures {
    var token: IpadicFeatures = {
      word_id: word_id,
      word_type: type,
      word_position: position,
      surface_form: features[0],
      pos: features[1],
      pos_detail_1: features[2],
      pos_detail_2: features[3],
      pos_detail_3: features[4],
      conjugated_type: features[5],
      conjugated_form: features[6],
      basic_form: features[7],
      reading: features[8],
      pronunciation: features[9],
    };
    // token.word_id = word_id;
    // token.word_type = type;
    // token.word_position = position;

    // token.surface_form = features[0];
    // token.pos = features[1];
    // token.pos_detail_1 = features[2];
    // token.pos_detail_2 = features[3];
    // token.pos_detail_3 = features[4];
    // token.conjugated_type = features[5];
    // token.conjugated_form = features[6];
    // token.basic_form = features[7];
    // token.reading = features[8];
    // token.pronunciation = features[9];

    return token;
  }
  formatUnknownEntry(
    word_id: number,
    position: number,
    type: string,
    features: string[],
    surface_form: string,
  ): IpadicFeatures {
    var token: IpadicFeatures = {
      word_id: word_id,
      word_type: type,
      word_position: position,
      surface_form: surface_form,
      pos: features[1],
      pos_detail_1: features[2],
      pos_detail_2: features[3],
      pos_detail_3: features[4],
      conjugated_type: features[5],
      conjugated_form: features[6],
      basic_form: features[7],
      // reading: features[8],
      // pronunciation: features[9]
    };

    // token.word_id = word_id;
    // token.word_type = type;
    // token.word_position = position;

    // token.surface_form = surface_form;
    // token.pos = features[1];
    // token.pos_detail_1 = features[2];
    // token.pos_detail_2 = features[3];
    // token.pos_detail_3 = features[4];
    // token.conjugated_type = features[5];
    // token.conjugated_form = features[6];
    // token.basic_form = features[7];
    // // token.reading = features[8];
    // // token.pronunciation = features[9];
    return token;
  }
}

export default IpadicFormatter;
