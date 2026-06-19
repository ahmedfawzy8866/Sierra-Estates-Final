// sierra-estates/lib/dsl/parser.ts
// Sierra Estates DSL V2.0 — Full Parser + Firestore Query Builder
//
// Usage:
//   import { parseDSL, buildFirestoreQuery } from "@/lib/dsl/parser";
//   const view   = parseDSL(dsl, "listings");
//   const query  = buildFirestoreQuery(view, db);

import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  WhereFilterOp,
  QueryConstraint,
  Query,
  DocumentData,
} from "firebase/firestore";

export type Visibility  = "public" | "broker" | "investor" | "internal";
export type AgentName   = "Scribe" | "Curator" | "Matchmaker" | "Closer";
export type ChartType   = "column" | "bar" | "line" | "donut" | "number";
export type CoverSize   = "small" | "medium" | "large";
export type CoverAspect = "cover" | "contain";
export type SortDir     = "asc" | "desc";

export interface FilterClause {
  field: string;
  operator: WhereFilterOp | "BETWEEN" | "IN";
  value: unknown;
  value2?: unknown;
}

export interface SortClause    { field: string; direction: SortDir; }
export interface CompareClause { field: string; against: string; }

export interface ChartConfig {
  type: ChartType;
  aggregate?: "count" | "sum" | "average" | "min" | "max";
  on?: string;
  color?: string;
  height?: "small" | "medium" | "large" | "extra_large";
  stackBy?: string;
  caption?: string;
}

export interface CoverConfig  { field: string; size?: CoverSize; aspect?: CoverAspect; }

export interface ParsedView {
  collectionName: string;
  visibility: Visibility;
  showFields: string[];
  showFieldsMap: Record<string, string | true>;
  hideFields: string[];
  filters: FilterClause[];
  sortBy: SortClause[];
  groupBy?: string;
  compounds: string[];
  compareFields: CompareClause[];
  aiTags: string[];
  chart?: ChartConfig;
  cover?: CoverConfig;
  wrapCells: boolean;
  freezeColumns: number;
  primaryIdField?: string;
  rawLines: string[];
}

function lex(dsl: string): string[] {
  return dsl
    .split(/\n|;/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith("#") && !l.startsWith("//"));
}

function extractQuoted(str: string): string[] {
  return str.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) ?? [];
}

function coerce(raw: string): string | number | boolean | null {
  const t = raw.trim().replace(/^"|"$/g, "");
  if (t === "null" || t === "")    return null;
  if (t === "true")                return true;
  if (t === "false")               return false;
  const n = Number(t.replace(/[^0-9.\-]/g, ""));
  if (!isNaN(n) && t.match(/^[\d.,\-]+$/)) return n;
  return t;
}

function parseFilterLine(line: string): FilterClause | null {
  const between = line.match(/FILTER\s+"(.+?)"\s+BETWEEN\s+([\d,]+)\s+AND\s+([\d,]+)/i);
  if (between) {
    return {
      field: between[1],
      operator: "BETWEEN",
      value:  parseFloat(between[2].replace(/,/g, "")),
      value2: parseFloat(between[3].replace(/,/g, "")),
    };
  }

  const inOp = line.match(/FILTER\s+"(.+?)"\s+IN\s+\((.+?)\)/i);
  if (inOp) return { field: inOp[1], operator: "in", value: extractQuoted(inOp[2]) };

  const notEmpty = line.match(/FILTER\s+"(.+?)"\s+IS\s+NOT\s+EMPTY/i);
  if (notEmpty) return { field: notEmpty[1], operator: "!=", value: null };

  const isEmpty = line.match(/FILTER\s+"(.+?)"\s+IS\s+EMPTY/i);
  if (isEmpty) return { field: isEmpty[1], operator: "==", value: null };

  const pct = line.match(/FILTER\s+"(.+?)"\s+(>=|<=|>|<|=|!=)\s+([\d.]+)\s+PERCENT/i);
  if (pct) {
    const op = pct[2] === "=" ? "==" : pct[2];
    return { field: pct[1], operator: op as WhereFilterOp, value: parseFloat(pct[3]) };
  }

  const std = line.match(/FILTER\s+"(.+?)"\s+(>=|<=|>|<|!=|=)\s+("?[^";\n]+"?)/i);
  if (std) {
    const op = std[2] === "=" ? "==" : std[2];
    return { field: std[1], operator: op as WhereFilterOp, value: coerce(std[3]) };
  }

  return null;
}

export function parseDSL(dsl: string, collectionName = "listings"): ParsedView {
  const lines = lex(dsl);
  const result: ParsedView = {
    collectionName,
    visibility:    "public",
    showFields:    [],
    showFieldsMap: {},
    hideFields:    [],
    filters:       [],
    sortBy:        [],
    compounds:     [],
    compareFields: [],
    aiTags:        [],
    wrapCells:     true,
    freezeColumns: 0,
    rawLines:      lines,
  };

  for (const line of lines) {
    const U = line.toUpperCase();
    if (U.startsWith("VISIBILITY")) {
      result.visibility = (line.split(/\s+/)[1]?.toLowerCase() ?? "public") as Visibility;
    } else if (U.startsWith("SHOW") && U.includes("AS PRIMARY_ID")) {
      const f = extractQuoted(line)[0];
      if (f) result.primaryIdField = f;
    } else if (U.startsWith("SHOW")) {
      const fields = extractQuoted(line.replace(/^SHOW\s+/i, ""));
      result.showFields = fields;
      for (const f of fields) result.showFieldsMap[f] = true;
    } else if (U.startsWith("HIDE")) {
      result.hideFields = extractQuoted(line);
    } else if (U.startsWith("FILTER")) {
      const f = parseFilterLine(line);
      if (f) result.filters.push(f);
    } else if (U.startsWith("SORT BY")) {
      const parts = line.replace(/^SORT BY\s+/i, "").split(",");
      for (const p of parts) {
        const m = p.trim().match(/"(.+?)"\s*(ASC|DESC)?/i);
        if (m) result.sortBy.push({ field: m[1], direction: (m[2]?.toLowerCase() ?? "asc") as SortDir });
      }
    } else if (U.startsWith("GROUP BY")) {
      result.groupBy = extractQuoted(line)[0];
    } else if (U.startsWith("COMPOUND IN")) {
      result.compounds = extractQuoted(line.replace(/^COMPOUND IN\s*/i, ""));
    } else if (U.startsWith("COMPARE")) {
      const m = line.match(/COMPARE\s+"(.+?)"\s+AGAINST\s+"(.+?)"/i);
      if (m) result.compareFields.push({ field: m[1], against: m[2] });
    } else if (U.startsWith("AI TAGS")) {
      result.aiTags = extractQuoted(line.replace(/^AI TAGS\s*/i, ""));
    } else if (U.startsWith("WRAP CELLS")) {
      result.wrapCells = U.includes("TRUE");
    } else if (U.startsWith("FREEZE COLUMNS")) {
      result.freezeColumns = parseInt(line.split(/\s+/).pop() ?? "0") || 0;
    } else if (U.startsWith("COVER")) {
      const m = line.match(/COVER\s+"(.+?)"(?:\s+SIZE\s+(\w+))?(?:\s+ASPECT\s+(\w+))?/i);
      if (m) result.cover = { field: m[1], size: m[2] as CoverSize | undefined, aspect: m[3] as CoverAspect | undefined };
    } else if (U.startsWith("CHART")) {
      const typeM  = line.match(/CHART\s+(\w+)/i);
      const aggM   = line.match(/AGGREGATE\s+(\w+)(?:\s+ON\s+"(.+?)")?/i);
      const colorM = line.match(/COLOR\s+(\w+)/i);
      const hgtM   = line.match(/HEIGHT\s+(\w+)/i);
      if (typeM) {
        result.chart = {
          type:      typeM[1].toLowerCase() as ChartType,
          aggregate: aggM?.[1]?.toLowerCase() as ChartConfig["aggregate"],
          on:        aggM?.[2],
          color:     colorM?.[1],
          height:    hgtM?.[1] as ChartConfig["height"],
        };
      }
    }
  }

  return result;
}

export function buildFirestoreQuery(
  parsed: ParsedView,
  db: Firestore,
  maxLimit = 50,
): Query<DocumentData> {
  const constraints: QueryConstraint[] = [];

  for (const f of parsed.filters) {
    if (f.operator === "BETWEEN" && f.value2 !== undefined) {
      constraints.push(where(f.field, ">=", f.value));
      constraints.push(where(f.field, "<=", f.value2));
    } else if (f.operator === "IN" || f.operator === "in") {
      const vals = Array.isArray(f.value) ? f.value : [f.value];
      constraints.push(where(f.field, "in", vals));
    } else if (f.operator !== "BETWEEN") {
      constraints.push(where(f.field, f.operator as WhereFilterOp, f.value));
    }
  }

  if (parsed.compounds.length > 0) {
    if (parsed.compounds.length === 1) {
      constraints.push(where("Compound", "==", parsed.compounds[0]));
    } else {
      constraints.push(where("Compound", "in", parsed.compounds));
    }
  }

  for (const s of parsed.sortBy) {
    constraints.push(orderBy(s.field, s.direction));
  }

  constraints.push(limit(maxLimit));
  return query(collection(db, parsed.collectionName), ...constraints);
}

export function applyFieldVisibility<T extends Record<string, unknown>>(
  doc: T,
  parsed: ParsedView,
): Partial<T> {
  if (parsed.showFields.length === 0 && parsed.hideFields.length === 0) return doc;
  const result: Partial<T> = {};
  const fields = parsed.showFields.length > 0 ? parsed.showFields : Object.keys(doc);
  for (const f of fields) {
    if (!parsed.hideFields.includes(f)) {
      result[f as keyof T] = doc[f as keyof T];
    }
  }
  return result;
}
