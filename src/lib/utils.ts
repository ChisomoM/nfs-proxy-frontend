import { type DocOverride, type OpenApiSpec } from "@/types/openapi";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formateDate(date: Date | string): string {
  return dayjs(date).format("DD/MM/YYYY");
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const mergeDocs = (spec: OpenApiSpec, overrides: DocOverride[]): OpenApiSpec => {
  if (!overrides.length) return spec;

  const newSpec = JSON.parse(JSON.stringify(spec)); // Deep clone

  overrides.forEach(ov => {
    if (newSpec.paths[ov.path] && newSpec.paths[ov.path][ov.method]) {
      if (ov.description) {
        newSpec.paths[ov.path][ov.method].description = ov.description;
      }
      if (ov.summary) {
        newSpec.paths[ov.path][ov.method].summary = ov.summary;
      }
    }
  });

  return newSpec;
};

// Helper to resolve $ref schemas (basic implementation)
export const resolveSchema = (schema: any, definitions: any): any => {
  if (!schema) return {};
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    if (definitions && definitions[refName]) {
      return { ...definitions[refName], ...schema }; // Merge to keep original props if any
    }
  }
  return schema;
};

export function normalizeValidity(
  validity?: number | null,
  unit?: string | null
): { value?: number; unit?: "hours" | "days" | "weeks" | "months" } {
  if (validity === undefined || validity === null) return { value: undefined, unit: undefined };

  if (!unit) return { value: validity, unit: undefined };

  const u = unit.toString().toLowerCase();

  if (u.includes("min")) {
    // convert minutes -> hours
    const hours = Math.round((validity / 60) * 100) / 100;
    return { value: hours, unit: "hours" };
  }

  if (u.includes("hour") || u === "hrs" || u === "hr") {
    return { value: validity, unit: "hours" };
  }

  if (u.includes("day")) {
    return { value: validity, unit: "days" };
  }

  if (u.includes("week")) {
    return { value: validity, unit: "weeks" };
  }

  if (u.includes("month")) {
    return { value: validity, unit: "months" };
  }

  // fallback: if it already matches the target words, return as-is
  if (["hours", "days", "weeks", "months"].includes(u)) {
    return { value: validity, unit: u as "hours" | "days" | "weeks" | "months" };
  }

  // unknown unit -- return raw
  return { value: validity, unit: undefined };
}

/**
 * Return a nicely formatted validity string, using normalizeValidity and
 * applying sensible singular/plural wording (e.g. "1 month", "2 days").
 */
export function formatValidityDisplay(validity?: number | null, unit?: string | null): string {
  const res = normalizeValidity(validity, unit);
  if (res.value === undefined || res.unit === undefined) {
    if (validity === undefined || validity === null) return "";
    return `${validity} ${unit ?? ""}`.trim();
  }

  const v = res.value;
  const u = res.unit;
  // use singular when value is 1 (or 1.0)
  const isOne = Math.abs(Number(v) - 1) < 1e-9;
  const unitLabel = isOne ? u.replace(/s$/, "") : u;
  return `${Number.isInteger(v) ? v : v.toFixed(2)} ${unitLabel}`;
}
