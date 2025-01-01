import parseAtom from "../src/parseAtom";
import { describe, expect, test } from "vitest";

describe("parseAtom", () => {
  const description = "a";
  const trigger = "b";
  const snippet = "c";

  test("parseAtom", () => {
    const result = `'a':
  'prefix': 'b'
  'body': """
    c
  """`;
    expect(parseAtom(description, trigger, snippet)).toBe(result);
  });
});
