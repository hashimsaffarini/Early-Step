type FormValue = string | number | boolean | Blob | null | undefined;
export interface FormFields {
  [key: string]: FormValue | FormFields | readonly FormFields[];
}

/**
 * Builds `multipart/form-data` the way ASP.NET model binding expects:
 * nested objects as `Parent.Child`, arrays of objects as `Items[0].Field`.
 * `null` / `undefined` fields are omitted (the backend treats missing as "not provided").
 */
export function toFormData(fields: FormFields, prefix = '', target = new FormData()): FormData {
  for (const [key, value] of Object.entries(fields)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) continue;
    if (value instanceof Blob) {
      target.append(name, value);
    } else if (Array.isArray(value)) {
      (value as readonly FormFields[]).forEach((item, index) => {
        toFormData(item, `${name}[${index.toString()}]`, target);
      });
    } else if (typeof value === 'object') {
      toFormData(value as FormFields, name, target);
    } else {
      target.append(name, String(value));
    }
  }
  return target;
}
