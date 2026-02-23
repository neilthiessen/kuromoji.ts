import { test, expect, describe, beforeAll } from "vitest";
import { kuromoji } from "../src/kuromoji";
import Tokenizer from "../src/Tokenizer";
import { IpadicFeatures } from "../src/types";
import { readFile } from "node:fs/promises";

var DIC_DIR = "dict/";

describe("Tokenizer User Dictionary", function () {
  let tokenizer: Tokenizer<IpadicFeatures>;

  beforeAll(async () => {
    tokenizer = await kuromoji
      .builder({
        dicPath: DIC_DIR,
        loadMethod: "custom",
        readFileFunc: async (path) => {
          return readFile(path);
        },
      })
      .asyncBuild();
  });

  test("Word is split correctly without a user dictionary", function () {
    var path = tokenizer.tokenize("20日は日曜日です。");
    // console.log("path before user dictionary: ", path);

    // We expect "20" and "日" to be separate tokens normally in IPADic
    expect(path[0].surface_form).toBe("20");
    expect(path[1].surface_form).toBe("日");
  });

  test("Applies user dictionary correctly and overrides standard tokenization", function () {
    // Inject user dictionary
    tokenizer.addUserDictionary([
      {
        surface_form: "20日",
        pos: "カスタム名詞",
        reading: "ハツカ",
        pronunciation: "ハツカ",
      },
    ]);

    var path = tokenizer.tokenize("20日は日曜日です。");
    // console.log("path after user dictionary: ", path);

    // We now expect "20日" to be a single single token
    expect(path[0].word_type).toBe("USER");
    expect(path[0].surface_form).toBe("20日");
    expect(path[0].pos).toBe("カスタム名詞");
    expect(path[0].reading).toBe("ハツカ");
    expect(path[0].pronunciation).toBe("ハツカ");

    // The rest of the tokenization should continue as normal
    expect(path[1].surface_form).toBe("は");
    expect(path[2].surface_form).toBe("日曜日");
  });
});
