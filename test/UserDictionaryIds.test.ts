import { test, expect, describe, beforeAll } from "vitest";
import { kuromoji } from "../src/kuromoji";
import Tokenizer from "../src/Tokenizer";
import { IpadicFeatures } from "../src/types";
import { readFile } from "node:fs/promises";

var DIC_DIR = "dict/";

describe("Tokenizer Custom User Dictionary IDs and Connection Costs", function () {
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

  test("Applies user dictionary with custom left_id and right_id, and dynamic connection costs", function () {
    const customLeftId = 5000;
    const customRightId = 5001;

    var prePath = tokenizer.tokenize("カスタムAPIスーパーAPIテスト");

    expect(prePath[0].word_type).toBe("KNOWN");
    expect(prePath[0].surface_form).toBe("カスタム");

    expect(prePath[1].word_type).toBe("UNKNOWN");
    expect(prePath[1].surface_form).toBe("API");

    expect(prePath[2].word_type).toBe("KNOWN");
    expect(prePath[2].surface_form).toBe("スーパー");

    expect(prePath[3].word_type).toBe("UNKNOWN");
    expect(prePath[3].surface_form).toBe("API");

    expect(prePath[4].word_type).toBe("KNOWN");
    expect(prePath[4].surface_form).toBe("テスト");

    // Inject user dictionary with custom IDs
    tokenizer.addUserDictionary([
      {
        surface_form: "カスタムAPI",
        pos: "カスタム名詞",
        reading: "カスタムエーピーアイ",
        pronunciation: "カスタムエーピーアイ",
        left_id: customLeftId,
        right_id: customRightId,
        word_cost: -100000,
      },
      {
        surface_form: "スーパーAPI",
        pos: "カスタム名詞",
        reading: "スーパーエーピーアイ",
        pronunciation: "スーパーエーピーアイ",
        left_id: customLeftId + 10,
        right_id: customRightId + 10,
        word_cost: -100000,
      },
    ]);

    // Before we add the connection costs, our new words will be heavily disfavored because they don't
    // connect to any words in the standard dictionary

    var midPath = tokenizer.tokenize("カスタムAPIスーパーAPIテスト");

    expect(midPath[0].word_type).toBe("KNOWN");
    expect(midPath[0].surface_form).toBe("カスタム");

    expect(midPath[1].word_type).toBe("UNKNOWN");
    expect(midPath[1].surface_form).toBe("API");

    expect(midPath[2].word_type).toBe("KNOWN");
    expect(midPath[2].surface_form).toBe("スーパー");

    expect(midPath[3].word_type).toBe("UNKNOWN");
    expect(midPath[3].surface_form).toBe("API");

    expect(midPath[4].word_type).toBe("KNOWN");
    expect(midPath[4].surface_form).toBe("テスト");

    // Add very low connection costs specifically for "カスタムAPI" followed by "スーパーAPI"
    tokenizer.addCustomConnectionCosts([
      {
        forward_id: customRightId, // The word before (カスタムAPI) right_id
        backward_id: customLeftId + 10, // The word after (スーパーAPI) left_id
        cost: -500000, // Extremely low connection cost
      },
      {
        forward_id: customRightId + 10, // スーパーAPI
        backward_id: 1283, // テスト (general noun left_id in ipadic is 1283)
        cost: -500000,
      },
    ]);

    var path = tokenizer.tokenize("カスタムAPIスーパーAPIテスト");

    // We expect "カスタムAPI" and "スーパーAPI" to be connected smoothly and identified as USER tokens
    expect(path[0].word_type).toBe("USER");
    expect(path[0].surface_form).toBe("カスタムAPI");
    expect(path[0].pos).toBe("カスタム名詞");

    expect(path[1].word_type).toBe("USER");
    expect(path[1].surface_form).toBe("スーパーAPI");

    // The rest of the sentence should tokenize normally (テスト)
    expect(path[2].surface_form).toBe("テスト");
  });
});
