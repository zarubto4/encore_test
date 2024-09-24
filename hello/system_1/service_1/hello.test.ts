import { describe, expect, test } from "vitest";
import { get } from "./hello";

describe("get", () => {
  test("should combine string with parameter value", async () => {
    const resp = await get({ name: "world" , test: "test"});
    expect(resp.message).toBe("Hello world!");
  });
});
