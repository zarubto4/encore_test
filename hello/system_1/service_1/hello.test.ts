import { describe, expect, test } from "vitest";
import {hello} from "./hello";

describe("get", () => {
  test("should combine string with parameter value", async () => {
    const resp = await hello({ name: "world" , test: "test"});
    expect(resp.message).toBe("Hello world!");
  });
});
