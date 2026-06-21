/**
 * MassBlast — Phone Number Parser
 *
 * The core logic for extracting, validating, normalizing, and deduplicating
 * phone numbers from messy input (pasted text, CSV, manual entry).
 *
 * Supported input formats:
 *   - "+20 100 123 4567"        (E.164 with spaces)
 *   - "01001234567"              (Egyptian local, 11 digits)
 *   - "00201001234567"           (Egyptian with 00 prefix)
 *   - "+1 (415) 555-2671"       (US with formatting)
 *   - "Name: John, Phone: +201001234567"  (embedded in text)
 *   - "John,+201001234567,Cairo"          (CSV-like)
 *   - "WhatsApp: 201001234567"            (labeled)
 *
 * Normalization rules:
 *   1. Strip all non-digit characters except leading +
 *   2. Remove leading 00 (international prefix)
 *   3. Remove leading 0 (local prefix) and prepend default country code
 *   4. Validate: 7-15 digits total (E.164 spec)
 *   5. Deduplicate by normalized number
 *
 * WhatsApp deep link format:
 *   https://wa.me/<number>?text=<urlencoded_message>
 *   https://web.whatsapp.com/send?phone=<number>&text=<urlencoded_message>
 */

export interface ParsedNumber {
  /** Raw input as typed/pasted by the user */
  raw: string;
  /** Normalized E.164 format without + (e.g. "201001234567") */
  normalized: string;
  /** E.164 with + (e.g. "+201001234567") */
  e164: string;
  /** Display format (e.g. "+20 100 123 4567") */
  display: string;
  /** Optional name extracted from the input (e.g. "John,+20100..." → "John") */
  name?: string;
  /** Whether the number passed validation */
  valid: boolean;
  /** Reason if invalid */
  error?: string;
  /** Detected country code (best guess) */
  countryCode?: string;
  /** wa.me link with optional pre-filled message */
  waLink: (message?: string) => string;
}

export interface ParseOptions {
  /** Default country code to prepend when number has no international prefix. Default: "20" (Egypt) */
  defaultCountryCode?: string;
  /** Whether to extract names from CSV-like input (column before the number) */
  extractNames?: boolean;
  /** Whether to remove duplicates */
  deduplicate?: boolean;
}

/**
 * Extract phone numbers from arbitrary text.
 * Uses a broad regex to find candidate numbers, then validates each.
 *
 * The regex matches:
 *   - Optional + or 00 prefix
 *   - 7-15 digits
 *   - Optional spaces, dashes, dots, parentheses between digits
 *   - Numbers embedded in text (e.g. "Phone: +20 100 123 4567")
 */
const PHONE_REGEX = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?0?\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{0,4}/g;

/**
 * More aggressive regex for pure digit sequences (e.g. "01001234567" in a CSV column).
 * Matches any contiguous run of 8-15 digits.
 */
const DIGIT_RUN_REGEX = /\b\d{8,15}\b/g;

/**
 * Parse a single phone number string into normalized E.164 format.
 */
export function parseSingleNumber(input: string, defaultCountryCode = "20"): ParsedNumber {
  const raw = input.trim();

  // Extract name if input contains commas or labels (e.g. "John,+201001234567" or "John: +201001234567")
  let name: string | undefined;
  let numberPart = raw;

  // Try to split by comma (CSV format: name,phone,...)
  if (raw.includes(",")) {
    const parts = raw.split(",").map((p) => p.trim());
    // Find the part that looks like a phone number
    const phoneIdx = parts.findIndex((p) => /\d{7,}/.test(p));
    if (phoneIdx >= 0) {
      numberPart = parts[phoneIdx];
      // Name is the first non-numeric part before the phone
      if (phoneIdx > 0) {
        name = parts[0];
      }
    }
  }

  // Try to split by colon (label format: "Phone: +201001234567")
  if (raw.includes(":") && !name) {
    const parts = raw.split(":").map((p) => p.trim());
    const phoneIdx = parts.findIndex((p) => /\d{7,}/.test(p));
    if (phoneIdx >= 0) {
      numberPart = parts[phoneIdx];
      if (phoneIdx > 0) {
        const label = parts[0].toLowerCase();
        // Only use as name if it's not a label keyword
        if (!["phone", "tel", "telephone", "mobile", "whatsapp", "number", "cell", "contact"].includes(label)) {
          name = parts[0];
        }
      }
    }
  }

  // Strip all non-digit characters except leading +
  let digits = numberPart.replace(/[^\d+]/g, "");

  // Handle leading +
  let hasPlus = digits.startsWith("+");
  if (hasPlus) {
    digits = digits.substring(1);
  }

  // Handle 00 prefix (international dialing prefix)
  if (digits.startsWith("00")) {
    digits = digits.substring(2);
    hasPlus = true; // 00 means international
  }

  // Handle local number with leading 0 (e.g. Egyptian "01001234567")
  if (!hasPlus && digits.startsWith("0")) {
    digits = digits.substring(1);
    digits = defaultCountryCode + digits;
  }

  // If no country code and number is short, prepend default
  if (!hasPlus && digits.length < 11) {
    digits = defaultCountryCode + digits;
  }

  // Validate
  const valid = digits.length >= 7 && digits.length <= 15;
  let error: string | undefined;
  if (!valid) {
    error = digits.length < 7
      ? "Too short (minimum 7 digits)"
      : "Too long (maximum 15 digits)";
  }

  // Detect country code (best guess based on prefix)
  const countryCode = detectCountryCode(digits);

  // Format for display
  const display = formatDisplay(digits, countryCode);

  const e164 = "+" + digits;

  return {
    raw,
    normalized: digits,
    e164,
    display,
    name,
    valid,
    error,
    countryCode,
    waLink: (message?: string) => buildWaLink(digits, message),
  };
}

/**
 * Parse a block of text containing phone numbers.
 * Extracts all numbers, validates them, and optionally deduplicates.
 *
 * @example
 * parseNumbers("John,+201001234567\nSarah,01001234568")
 * // → [{ name: "John", normalized: "201001234567", ... }, ...]
 */
export function parseNumbers(
  text: string,
  options: ParseOptions = {}
): ParsedNumber[] {
  const { defaultCountryCode = "20", extractNames = true, deduplicate = true } = options;

  // Split by newlines first (each line might be a contact: "Name,Phone" or just "Phone")
  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);

  const results: ParsedNumber[] = [];

  for (const line of lines) {
    // If the line contains commas (CSV), treat the whole line as one contact
    if (line.includes(",") && extractNames) {
      const parsed = parseSingleNumber(line, defaultCountryCode);
      results.push(parsed);
      continue;
    }

    // If the line contains a colon (label), treat the whole line as one contact
    if (line.includes(":") && extractNames) {
      const parsed = parseSingleNumber(line, defaultCountryCode);
      results.push(parsed);
      continue;
    }

    // Otherwise extract all phone numbers from the line
    // Try the formatted regex first
    let matches = line.match(PHONE_REGEX) || [];

    // If no matches, try pure digit runs
    if (matches.length === 0) {
      matches = line.match(DIGIT_RUN_REGEX) || [];
    }

    if (matches.length === 0 && /\d{7,}/.test(line)) {
      // Fallback: the whole line might be a number
      matches = [line];
    }

    for (const match of matches) {
      const parsed = parseSingleNumber(match, defaultCountryCode);
      results.push(parsed);
    }
  }

  // Deduplicate by normalized number
  if (deduplicate) {
    const seen = new Set<string>();
    const deduped: ParsedNumber[] = [];
    for (const r of results) {
      if (!seen.has(r.normalized)) {
        seen.add(r.normalized);
        deduped.push(r);
      }
    }
    return deduped;
  }

  return results;
}

/**
 * Parse a CSV file's text content.
 * Expected format: any column containing a phone number will be extracted.
 * If a "name" column exists, it will be paired with the phone.
 */
export function parseCSV(
  csvText: string,
  options: ParseOptions = {}
): ParsedNumber[] {
  const { defaultCountryCode = "20" } = options;

  const lines = csvText.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Detect delimiter (comma, semicolon, tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";

  // Parse header
  const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase());

  // Find phone and name columns
  let phoneCol = -1;
  let nameCol = -1;
  headers.forEach((h, i) => {
    if (/phone|tel|telephone|mobile|whatsapp|number|cell|contact/.test(h)) {
      phoneCol = i;
    }
    if (/name|first|full|client|customer/.test(h)) {
      nameCol = i;
    }
  });

  const results: ParsedNumber[] = [];

  // If no phone column detected, treat each row as raw text
  if (phoneCol === -1) {
    return parseNumbers(csvText, options);
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim());
    const phone = cols[phoneCol];
    const name = nameCol >= 0 ? cols[nameCol] : undefined;

    if (phone) {
      const parsed = parseSingleNumber(phone, defaultCountryCode);
      if (name && !parsed.name) {
        parsed.name = name;
      }
      results.push(parsed);
    }
  }

  // Deduplicate
  if (options.deduplicate !== false) {
    const seen = new Set<string>();
    const deduped: ParsedNumber[] = [];
    for (const r of results) {
      if (!seen.has(r.normalized)) {
        seen.add(r.normalized);
        deduped.push(r);
      }
    }
    return deduped;
  }

  return results;
}

/**
 * Build a WhatsApp deep link for a number.
 *
 * @param number Normalized number (digits only, no +). E.g. "201001234567"
 * @param message Optional pre-filled message text
 * @returns wa.me URL, e.g. "https://wa.me/201001234567?text=Hello"
 */
export function buildWaLink(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Build a WhatsApp Web "send" link (opens WhatsApp Web in browser).
 */
export function buildWaWebLink(number: string, message?: string): string {
  const base = `https://web.whatsapp.com/send?phone=${number}`;
  if (message) {
    return `${base}&text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Detect country code from a normalized number (best guess).
 */
function detectCountryCode(digits: string): string | undefined {
  // Egypt: starts with 20
  if (digits.startsWith("20")) return "EG";
  // UAE: starts with 971
  if (digits.startsWith("971")) return "AE";
  // Saudi: starts with 966
  if (digits.startsWith("966")) return "SA";
  // Kuwait: starts with 965
  if (digits.startsWith("965")) return "KW";
  // Qatar: starts with 974
  if (digits.startsWith("974")) return "QA";
  // USA/Canada: starts with 1
  if (digits.startsWith("1")) return "US";
  // UK: starts with 44
  if (digits.startsWith("44")) return "GB";
  // Germany: starts with 49
  if (digits.startsWith("49")) return "DE";
  // France: starts with 33
  if (digits.startsWith("33")) return "FR";
  return undefined;
}

/**
 * Format a number for display (e.g. "201001234567" → "+20 100 123 4567").
 */
function formatDisplay(digits: string, countryCode?: string): string {
  if (countryCode === "EG" && digits.length === 12) {
    // +20 100 123 4567
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (countryCode === "AE" && digits.length === 12) {
    // +971 50 123 4567
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (countryCode === "SA" && digits.length === 12) {
    // +966 50 123 4567
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (countryCode === "US" && digits.length === 11) {
    // +1 (415) 555-2671
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Generic: group in 3s
  const groups: string[] = [];
  let remaining = digits;
  while (remaining.length > 0) {
    groups.push(remaining.slice(0, 3));
    remaining = remaining.slice(3);
  }
  return "+" + groups.join(" ");
}

/**
 * Replace template variables in a message.
 * Supported variables:
 *   {name}   → recipient's name (or "there" if unknown)
 *   {phone}  → recipient's phone number (E.164 format)
 *   {first}  → first name (first word of name, or "there")
 */
export function personalizeMessage(
  template: string,
  recipient: ParsedNumber
): string {
  const name = recipient.name || "there";
  const first = name.split(" ")[0] || "there";

  return template
    .replace(/\{name\}/gi, name)
    .replace(/\{first\}/gi, first)
    .replace(/\{phone\}/gi, recipient.e164);
}

/**
 * Generate wa.me links for a list of parsed numbers with an optional message template.
 */
export function generateLinks(
  numbers: ParsedNumber[],
  messageTemplate?: string,
  useWeb = false
): Array<{ number: ParsedNumber; message: string; link: string }> {
  return numbers
    .filter((n) => n.valid)
    .map((n) => {
      const message = messageTemplate
        ? personalizeMessage(messageTemplate, n)
        : undefined;
      const link = useWeb
        ? buildWaWebLink(n.normalized, message)
        : buildWaLink(n.normalized, message);
      return { number: n, message: message || "", link };
    });
}

/**
 * Export parsed numbers as CSV.
 */
export function exportToCSV(
  numbers: ParsedNumber[],
  includeLinks = false,
  messageTemplate?: string
): string {
  const headers = ["Name", "Phone", "E.164", "Valid", "Country"];
  if (includeLinks) headers.push("WhatsApp Link");
  if (messageTemplate) headers.push("Personalized Message");

  const rows = numbers.map((n) => {
    const row = [
      n.name || "",
      n.display,
      n.e164,
      n.valid ? "Yes" : "No",
      n.countryCode || "",
    ];
    if (includeLinks) {
      const message = messageTemplate
        ? personalizeMessage(messageTemplate, n)
        : undefined;
      row.push(buildWaLink(n.normalized, message));
    }
    if (messageTemplate) {
      row.push(personalizeMessage(messageTemplate, n));
    }
    return row.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}
