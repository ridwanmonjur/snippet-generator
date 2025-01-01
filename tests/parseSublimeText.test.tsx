import parseSublimeText from "../src/parseSublimeText";
import { describe, expect, test } from "vitest";

describe("parseSublimeText", () => {
  const description = "a";
  const trigger = "b";
  const snippet = "c";

  test("parses simple snippet", () => {
    const result = `<snippet>
  <content><![CDATA[
c
]]></content>
  <trigger>b</trigger>
  <description>a</description>
  <!-- Optional: Set a scope to limit where the snippet will trigger -->
  <!-- <scope >source.python</scope > -->
</snippet>`;
    expect(parseSublimeText(description, trigger, snippet)).toBe(result);
  });
});
