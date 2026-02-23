# Kuromoji.ts Overview

This document provides a methodical analysis of how `kuromoji.ts` works, how it loads its dictionaries, and how one can approach adding custom words like "20日" dynamically at runtime after the initial dictionaries are loaded.

## 1. Core Architecture

The `kuromoji.ts` tokenizer relies on the **Viterbi Algorithm** to find the most probable sequence of words (tokens) from an unsegmented string of characters. The core process is divided into three main parts:

### A. The Tokenizer (`src/Tokenizer.ts`)

The `Tokenizer` acts as the main entry point:

1. **Sentence Splitting**: It first splits the input text by punctuation (`、` or `。`) to reduce the length of the string analyzed at any one time, optimizing performance.
2. **Lattice Building**: It passes each sentence to the `ViterbiBuilder` which creates a graph of all possible word tokenizations.
3. **Searching**: It passes the lattice to the `ViterbiSearcher` which calculates the sequence with the lowest overall cost (best path).
4. **Formatting**: It formats the resulting optimal path nodes into readable token objects.

### B. Viterbi Lattice Building (`src/viterbi/ViterbiBuilder.ts`)

The builder loops character-by-character through the sentence. At each character:

- It performs a **Common Prefix Search** in the `DoubleArray` Trie (`this.trie.commonPrefixSearch(tail)`) to find all known dictionary words that start at this position.
- For each matched word, it creates a `ViterbiNode` holding its left/right connection IDs and word cost.
- If no dictionary word is found or if the character belongs to a class that forces unknown word processing (like digits or new symbols), it queries the `UnknownDictionary` and creates an `UNKNOWN` node.

### C. Viterbi Search (`src/viterbi/ViterbiSearcher.ts`)

The searcher calculates the "Connection Cost" between consecutive nodes in the lattice, adding it to the node's individual "Word Cost". It uses Dynamic Programming to find the path from the start sentence node to the end sentence node with the minimal total cost.

---

## 2. Data and Dictionary Loading

The dictionary data is pre-compiled and compressed. `kuromoji.ts` doesn't load plain text; instead, it uses a highly space-optimized binary format broken down into several parts. Loading occurs via the `DictionaryLoader` and its subclasses (e.g., `FromBufferLoader`, `BrowserDictionaryLoader`):

- **Trie (`base.dat`, `check.dat`)**
  Stored as an array using the `doublearray` library. Used for fast common-prefix lookup. This structure maps strings to an integer ID representing the prefix match.
- **Token Info Dictionary (`tid.dat`, `tid_pos.dat`, `tid_map.dat`)**
  Stores linguistic features (part of speech, reading, etc.). The integer ID from the Trie lookup maps into this dictionary to fetch right/left connection IDs, word cost, and an offset to the feature string.
- **Connection Costs (`cc.dat`)**
  A 2D matrix structure mapping an upstream node's `right_id` and a downstream node's `left_id` to a transition cost penalty.
- **Unknown Dictionary (`unk*.dat`)**
  Rules and costs for generating unknown words.

The base dictionaries (`DynamicDictionaries`) load all of these structures into memory asynchronously.

---

## 3. Adding Words Dynamically (e.g., "20日")

By design, the main underlying data structure used for word lookups—the **Double-Array Trie**—is **static**. The `doublearray` implementation packs entries compactly, meaning **you cannot dynamically insert an element into the trie once it's built without rebuilding it from scratch.**

Currently, looking into `src/Tokenizer.ts`, there is an unimplemented feature marker:

```typescript
} else {
  // TODO User dictionary
  token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
}
```

Because this is not natively implemented yet, if you want "20日" to be recognized as a single token, you have two distinct approaches:

### Approach A: Rebuilding the Dictionary (Offline/Pre-load Approach)

Use `DictionaryBuilder` (from `src/dict/builder/DictionaryBuilder.ts`) to add your tokens and completely rebuild the `.dat` files (or pass them as buffers).

1. Add your new token via `dictionaryBuilder.addTokenInfoDictionary("20日, ...features... ");`
2. Build the `DynamicDictionaries`.
3. Feed that into the `Tokenizer`.
   **Pros**: Requires no architectural changes to `kuromoji.ts`.
   **Cons**: Slow. Rebuilding the 10MB+ Trie takes a lot of CPU and time and shouldn't be done continuously at runtime in a frontend/lightweight environment.

### Approach B: Implementing the "User Dictionary" Feature (Dynamic Approach)

You can patch `kuromoji.ts` to fully support User Dictionaries over the static dictionaries. This involves adding another Trie/Hash map into the `DynamicDictionaries` object and modifying the Lattice builder.

1. **Create a `UserDictionary` Class**
   This class could use a standard JavaScript `Map` or a secondary, much smaller `DoubleArray` to store user words.
2. **Modify `ViterbiBuilder.ts`**
   In the `build()` function, right alongside searching the main `trie`, search the `UserDictionary`.

   ```typescript
   var vocabulary = this.trie.commonPrefixSearch(tail);
   // + ADD THIS:
   var user_vocabulary = this.user_dictionary_trie.commonPrefixSearch(tail);

   // Loop through both sets, appending to the lattice.
   ```

3. **Assign Costs to User Words**
   When creating `ViterbiNode` instances for user words, you can grant them artificially low "Word Costs" (-10000) so the `ViterbiSearcher` is mathematically forced to strongly prefer your user tokens (like "20日") over the default tokenization ("20", "日").
4. **Handle in `Tokenizer.ts`**
   Update the `// TODO User dictionary` block to correctly read features from your newly defined User Dictionary structure instead of the default `.dat` maps.

**Pros**: Highly dynamic. Adding words is instantaneous because user dictionaries are tiny and quick to build.
**Cons**: Requires modifying the source code of `kuromoji.ts` to complete the unimplemented `TODO`.
