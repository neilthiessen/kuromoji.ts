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

import fs from "node:fs";
import CharacterDefinition from "../../src/dict/CharacterDefinition";
import InvokeDefinitionMap from "../../src/dict/InvokeDefinitionMap";
import CharacterDefinitionBuilder from "../../src/dict/builder/CharacterDefinitionBuilder";
import { beforeAll, describe, expect, test } from "vitest";

var DIC_DIR = "test/resource/minimum-dic/";

describe("CharacterDefinition from char.def", function () {
  var char_def: CharacterDefinition; // target object

  beforeAll(function () {
    var cd_builder = new CharacterDefinitionBuilder();
    fs.readFileSync(DIC_DIR + "char.def", "utf-8")
      .split("\n")
      .map(function (line) {
        cd_builder.putLine(line);
      });
    char_def = cd_builder.build();
  });

  test("lookup by space, return SPACE class", function () {
    expect(char_def.lookup(" ").class_name).to.equal("SPACE");
  });
  test("lookup by 日, return KANJI class", function () {
    expect(char_def.lookup("日").class_name).to.equal("KANJI");
  });
  test("lookup by !, return SYMBOL class", function () {
    expect(char_def.lookup("!").class_name).to.equal("SYMBOL");
  });
  test("lookup by 1, return NUMERIC class", function () {
    expect(char_def.lookup("1").class_name).to.equal("NUMERIC");
  });
  test("lookup by A, return ALPHA class", function () {
    expect(char_def.lookup("A").class_name).to.equal("ALPHA");
  });
  test("lookup by あ, return HIRAGANA class", function () {
    expect(char_def.lookup("あ").class_name).to.equal("HIRAGANA");
  });
  test("lookup by ア, return KATAKANA class", function () {
    expect(char_def.lookup("ア").class_name).to.equal("KATAKANA");
  });
  test("lookup by 一, return KANJINUMERIC class", function () {
    expect(char_def.lookup("一").class_name).to.equal("KANJINUMERIC");
  });
  test("lookup by surrogate pair character, return DEFAULT class", function () {
    expect(char_def.lookup("𠮷").class_name).to.equal("DEFAULT");
  });

  test("lookup by 一, return KANJI class as compatible category", function () {
    expect(char_def.lookupCompatibleCategory("一")[0].class_name).to.equal(
      "KANJI",
    );
  });
  test("lookup by 0x4E00, return KANJINUMERIC class as compatible category", function () {
    expect(
      char_def.lookupCompatibleCategory(String.fromCharCode(0x3007))[0]
        .class_name,
    ).to.equal("KANJINUMERIC");
  });

  test("SPACE class definition of INVOKE: false, GROUP: true, LENGTH: 0", function () {
    expect(char_def.lookup(" ").is_always_invoke).to.be.equal(0);
    expect(char_def.lookup(" ").is_grouping).to.be.equal(1);
    expect(char_def.lookup(" ").max_length).to.be.equal(0);
  });
  test("KANJI class definition of INVOKE: false, GROUP: false, LENGTH: 2", function () {
    expect(char_def.lookup("日").is_always_invoke).to.be.equal(0);
    expect(char_def.lookup("日").is_grouping).to.be.equal(0);
    expect(char_def.lookup("日").max_length).to.be.equal(2);
  });
  test("SYMBOL class definition of INVOKE: true, GROUP: true, LENGTH: 0", function () {
    expect(char_def.lookup("!").is_always_invoke).to.be.equal(1);
    expect(char_def.lookup("!").is_grouping).to.be.equal(1);
    expect(char_def.lookup("!").max_length).to.be.equal(0);
  });
  test("NUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0", function () {
    expect(char_def.lookup("1").is_always_invoke).to.be.equal(1);
    expect(char_def.lookup("1").is_grouping).to.be.equal(1);
    expect(char_def.lookup("1").max_length).to.be.equal(0);
  });
  test("ALPHA class definition of INVOKE: true, GROUP: true, LENGTH: 0", function () {
    expect(char_def.lookup("A").is_always_invoke).to.be.equal(1);
    expect(char_def.lookup("A").is_grouping).to.be.equal(1);
    expect(char_def.lookup("A").max_length).to.be.equal(0);
  });
  test("HIRAGANA class definition of INVOKE: false, GROUP: true, LENGTH: 2", function () {
    expect(char_def.lookup("あ").is_always_invoke).to.be.equal(0);
    expect(char_def.lookup("あ").is_grouping).to.be.equal(1);
    expect(char_def.lookup("あ").max_length).to.be.equal(2);
  });
  test("KATAKANA class definition of INVOKE: true, GROUP: true, LENGTH: 2", function () {
    expect(char_def.lookup("ア").is_always_invoke).to.be.equal(1);
    expect(char_def.lookup("ア").is_grouping).to.be.equal(1);
    expect(char_def.lookup("ア").max_length).to.be.equal(2);
  });
  test("KANJINUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0", function () {
    expect(char_def.lookup("一").is_always_invoke).to.be.equal(1);
    expect(char_def.lookup("一").is_grouping).to.be.equal(1);
    expect(char_def.lookup("一").max_length).to.be.equal(0);
  });
  test("Save and load", function () {
    if (!char_def.invoke_definition_map) {
      throw new Error("CharacterDefinition is not defined");
    }
    var buffer = char_def.invoke_definition_map.toBuffer();
    var invoke_def = InvokeDefinitionMap.load(buffer);
    expect(invoke_def.getCharacterClass(0)).toEqual({
      class_id: 0,
      class_name: "DEFAULT",
      is_always_invoke: 0,
      is_grouping: 1,
      max_length: 0,
    });
    expect(invoke_def.getCharacterClass(10)).toEqual({
      class_id: 10,
      class_name: "CYRILLIC",
      is_always_invoke: 1,
      is_grouping: 1,
      max_length: 0,
    });
  });
});
