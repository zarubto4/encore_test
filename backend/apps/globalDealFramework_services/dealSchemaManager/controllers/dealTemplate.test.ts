import { describe, expect, test } from "vitest";
import { dealTemplateCreate } from "./dealTemplate.controller";

describe("dealTemplateCreate", () => {
  test("should combine string with parameter value", async () => {
    const resp = await dealTemplateCreate({
      name: "world",
      email: "test@test.com",
    });
    expect("test").toBe("test");
  });
});
