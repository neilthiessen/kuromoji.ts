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

import { test, expect } from "vitest";
import SurrogateAwareString from "../../src/util/SurrogateAwareString";

test("length 1", function () {
  var str = new SurrogateAwareString("𠮷"); // target object
  expect(str.length).to.eql(1);
});
test("length 3", function () {
  var str = new SurrogateAwareString("𠮷野屋"); // target object
  expect(str.length).to.eql(3);
});
test("slice", function () {
  var str = new SurrogateAwareString("𠮷野屋"); // target object
  expect(str.slice(0)).to.eql("𠮷野屋");
  expect(str.slice(1)).to.eql("野屋");
  expect(str.slice(2)).to.eql("屋");
});
test("charAt", function () {
  var str = new SurrogateAwareString("𠮷野屋"); // target object
  expect(str.charAt(0)).to.eql("𠮷");
  expect(str.charAt(1)).to.eql("野");
  expect(str.charAt(2)).to.eql("屋");
});
test("charCodeAt", function () {
  var str = new SurrogateAwareString("𠮷野屋"); // target object
  expect(str.charCodeAt(0)).to.eql(0x20bb7);
  expect(str.charCodeAt(1)).to.eql("野".charCodeAt(0));
  expect(str.charCodeAt(2)).to.eql("屋".charCodeAt(0));
});
