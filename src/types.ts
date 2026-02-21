// Type definitions for kuromoji.js 0.1
// Project: https://github.com/takuyaa/kuromoji.js
// Definitions by: MIZUSHIMA Junki <https://github.com/mzsm>, kgtkr <https://github.com/kgtkr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import DynamicDictionaries from "./dict/DynamicDictionaries";

export interface Formatter<T> {
  formatEntry(
    word_id: number,
    position: number,
    type: string,
    features: string[],
  ): T;
  formatUnknownEntry(
    word_id: number,
    position: number,
    type: string,
    features: string[],
    surface_form: string,
  ): T;
}
export type IpadicFormatter = Formatter<IpadicFeatures>;

export interface BaseFeatures {
  word_id: number;
  word_type: string;
  word_position: number;
  surface_form: string;
}

export interface IpadicFeatures extends BaseFeatures {
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading?: string | undefined;
  pronunciation?: string | undefined;
}

export type TauriReadFileFunc = (
  path: string,
  options?: any,
) => Promise<Uint8Array>;

export type TokenizerBuilderOptions =
  | {
      dicPath: string;
      loadMethod: "fs" | "fetch";
      // useWorker: boolean;
    }
  | {
      loadMethod: "from_buffers";
    }
  | {
      dicPath: string;
      readFileFunc: TauriReadFileFunc;
      loadMethod: "tauri";
    };

type Key = {
  k: string;
  v: any;
};

export type DoubleArray = {
  contain: (key: string) => boolean;
  lookup: (key: string) => number;
  commonPrefixSearch: (key: string) => Key[];
  traverse: Function;
  size: () => number;
  calc: Function;
  dump: Function;
};

export type DoubleArrayBuilder = {
  append: (key: string, value: number) => DoubleArray;
  build: (keys: Key[]) => DoubleArray;
  getChildrenInfo: (
    position: number,
    start: number,
    length: number,
  ) => Int32Array;
  setBC: (parent_id: number, children_info: number, _base: number) => void;
  findAllocatableBase: (children_info: number) => number;
};

export type AnyIntArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array;

export type DoubleArrayLoadFunction = (
  base_buffer: AnyIntArray,
  check_buffer: AnyIntArray,
) => DoubleArray;
export type DoubleArrayBuilderFunction = (
  initial_size: number,
) => DoubleArrayBuilder;

export type LoaderInternalCallback = (
  err: any,
  buffer?: ArrayBuffer | null,
) => void;
export type DictionaryLoaderCallback = (
  err: any,
  dic?: DynamicDictionaries,
) => void;

export const FILE_NAMES: {
  [key in keyof BufferPack]: {
    fileName: string;
    bufferKey: keyof BufferPack;
  };
} = {
  base: {
    fileName: "base.dat.gz.bin",
    bufferKey: "base",
  },
  check: {
    fileName: "check.dat.gz.bin",
    bufferKey: "check",
  },
  tid: {
    fileName: "tid.dat.gz.bin",
    bufferKey: "tid",
  },
  tid_pos: {
    fileName: "tid_pos.dat.gz.bin",
    bufferKey: "tid_pos",
  },
  tid_map: {
    fileName: "tid_map.dat.gz.bin",
    bufferKey: "tid_map",
  },
  cc: {
    fileName: "cc.dat.gz.bin",
    bufferKey: "cc",
  },
  unk: {
    fileName: "unk.dat.gz.bin",
    bufferKey: "unk",
  },
  unk_pos: {
    fileName: "unk_pos.dat.gz.bin",
    bufferKey: "unk_pos",
  },
  unk_map: {
    fileName: "unk_map.dat.gz.bin",
    bufferKey: "unk_map",
  },
  unk_char: {
    fileName: "unk_char.dat.gz.bin",
    bufferKey: "unk_char",
  },
  unk_compat: {
    fileName: "unk_compat.dat.gz.bin",
    bufferKey: "unk_compat",
  },
  unk_invoke: {
    fileName: "unk_invoke.dat.gz.bin",
    bufferKey: "unk_invoke",
  },
};

export type BufferPack = {
  base: ArrayBuffer;
  check: ArrayBuffer;
  tid: ArrayBuffer;
  tid_pos: ArrayBuffer;
  tid_map: ArrayBuffer;
  cc: ArrayBuffer;
  unk: ArrayBuffer;
  unk_pos: ArrayBuffer;
  unk_map: ArrayBuffer;
  unk_char: ArrayBuffer;
  unk_compat: ArrayBuffer;
  unk_invoke: ArrayBuffer;
};
