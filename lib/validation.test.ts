import { describe, expect, it } from "vitest";
import {
  PASSWORD_RULES,
  metPasswordRequirements,
  normalizeName,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/validation";

describe("validateEmail", () => {
  it("requires a value", () => {
    expect(validateEmail("   ")).toBe("emailRequired");
  });

  it("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email")).toBe("emailInvalid");
    expect(validateEmail("user@")).toBe("emailInvalid");
  });

  it("accepts valid addresses", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail(" user@example.com ")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("requires a value", () => {
    expect(validatePassword("")).toBe("passwordRequired");
  });

  it("enforces every rule of the shared policy", () => {
    expect(validatePassword("short")).toBe("passwordMinLength");
    expect(validatePassword("lowercase1!")).toBe("uppercaseRequired");
    expect(validatePassword("UPPERCASE1!")).toBe("lowercaseRequired");
    expect(validatePassword("NoDigits!!")).toBe("numberRequired");
    expect(validatePassword("NoSymbols12")).toBe("symbolRequired");
  });

  it("accepts a password that satisfies the policy", () => {
    expect(validatePassword("Str0ngPass!")).toBeNull();
  });
});

describe("metPasswordRequirements", () => {
  it("counts the met rules", () => {
    expect(metPasswordRequirements("")).toBe(0);
    expect(metPasswordRequirements("Str0ngPass!")).toBe(PASSWORD_RULES.length);
  });
});

describe("validatePasswordConfirmation", () => {
  it("requires the confirmation", () => {
    expect(validatePasswordConfirmation("Str0ngPass!", "")).toBe("confirmPasswordRequired");
  });

  it("detects a mismatch", () => {
    expect(validatePasswordConfirmation("Str0ngPass!", "Str0ngPass?")).toBe("passwordsMismatch");
  });

  it("accepts a matching confirmation", () => {
    expect(validatePasswordConfirmation("Str0ngPass!", "Str0ngPass!")).toBeNull();
  });
});

describe("validateName", () => {
  it("requires a value", () => {
    expect(validateName("  ")).toBe("nameRequired");
  });

  it("requires at least two characters", () => {
    expect(validateName("A")).toBe("nameMinLength");
  });

  it("requires a first and a last name", () => {
    expect(validateName("Gabriel")).toBe("fullNameRequired");
  });

  it("accepts a full name", () => {
    expect(validateName("Gabriel Silva")).toBeNull();
  });
});

describe("normalizeName", () => {
  it("title-cases each word", () => {
    expect(normalizeName("gabriel da silva")).toBe("Gabriel Da Silva");
  });
});
