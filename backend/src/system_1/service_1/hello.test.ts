import { describe, expect, test } from "vitest";
import {hallo1} from "./hello";

describe("hallo1", () => {
  test("should combine string with parameter value", async () => {
    const resp = await hallo1({ name: "world" , test: "test", username: "test"});
    expect(resp.message).toBe("Hello world!");
  });
});
