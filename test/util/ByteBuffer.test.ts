import { expect, test } from "vitest";
import ByteBuffer from "../../src/util/ByteBuffer";

const BufferTest = test.extend<{
  byteBuffer: ByteBuffer;
}>({
  byteBuffer: async ({}, use) => {
    await use(new ByteBuffer(50));
  },
});
BufferTest("putShort() and getShort()", function ({ byteBuffer }) {
  var v = -413;
  byteBuffer.putShort(v);
  expect(byteBuffer.position).equals(2);
  var got = byteBuffer.getShort(0);
  expect(got).equals(v);
});

BufferTest(
  "putString() and getString() 2 bytes UTF-8",
  function ({ byteBuffer }) {
    var str = "âbcde";
    byteBuffer.putString(str);
    // 2 bytes x1 + 1 byte x4 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).equals(7);
    var got = byteBuffer.getString(0);
    expect(got).equals(str);
  },
);

BufferTest(
  "putString() and getString() 3 bytes UTF-8",
  function ({ byteBuffer }) {
    var str = "あいうえお";
    byteBuffer.putString(str);
    // 3 bytes x5 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).equals(16);
    var got = byteBuffer.getString(0);
    expect(got).equals(str);
  },
);

BufferTest(
  "putString() and getString() 4 bytes UTF-8",
  function ({ byteBuffer }) {
    var str = "𠮷野屋";
    byteBuffer.putString(str);
    // 4 bytes x1 + 3 bytes x2 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).equals(11);
    var got = byteBuffer.getString(0);
    expect(got).equals(str);
  },
);

BufferTest("too long string against buffer size", function ({ byteBuffer }) {
  var str = "あいうえおかきくけこさしすせそたちつてと"; // 60 bytes
  byteBuffer.putString(str);
  expect(byteBuffer.position).equals(61);
  var got = byteBuffer.getString(0);
  expect(got).equals(str);
});
