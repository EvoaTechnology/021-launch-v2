/**
 * Utilities for validating and sanitizing untrusted free text inputs.
 * Keep lightweight and dependency-free for server runtime safety.
 */

export const DEFAULT_MAX_FREE_TEXT_LENGTH = 12000; // ~8-12k as requested

/**
 * Remove HTML tags, script/style blocks, and obvious JS URI/event handler patterns.
 * Since our inputs are expected to be plain text, we prefer stripping rather than escaping.
 */
export function sanitizePlainText(input: string): string {
  let output = input;
  // Remove <script> and <style> blocks explicitly first
  output = output.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  // Remove any remaining HTML tags
  output = output.replace(/<[^>]*>/g, "");
  // Remove inline event handlers and javascript: or data:text/html URIs remnants
  output = output.replace(/on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "");
  output = output.replace(/javascript:/gi, "");
  output = output.replace(/data:text\/html[^,]*,/gi, "");
  // Normalize whitespace and trim
  output = output.replace(/[\r\t]+/g, " ");
  output = output.replace(/\u0000/g, ""); // strip NULs
  output = output.replace(/\s{2,}/g, " ").trim();
  return output;
}

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateAndSanitizeFreeText(
  value: unknown,
  fieldName: string,
  options?: { required?: boolean; maxLength?: number }
): ValidationResult {
  const { required = true, maxLength = DEFAULT_MAX_FREE_TEXT_LENGTH } =
    options || {};

  if (value == null) {
    if (required) {
      return { ok: false, error: `${fieldName} is required` };
    }
    return { ok: true, value: "" };
  }

  if (typeof value !== "string") {
    return { ok: false, error: `${fieldName} must be a string` };
  }

  const sanitized = sanitizePlainText(value);
  if (sanitized.length > maxLength) {
    return {
      ok: false,
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { ok: true, value: sanitized };
}
