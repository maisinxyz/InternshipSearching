const provinces: Record<string, string> = {
  'british columbia': 'BC',
  ontario: 'ON',
  alberta: 'AB',
  quebec: 'QC',
  québec: 'QC',
  'nova scotia': 'NS',
  'new brunswick': 'NB',
  'newfoundland and labrador': 'NL',
  'prince edward island': 'PE',
  saskatchewan: 'SK',
  manitoba: 'MB',
  yukon: 'YT',
  'northwest territories': 'NT',
  nunavut: 'NU',
};

// Only supplied geography is classified. City names alone never establish a country.
export function sourceLocation(original_text: string) {
  const lower = original_text.toLowerCase();
  const province =
    original_text.match(/\b(BC|ON|AB|QC|NS|NB|NL|PE|SK|MB|YT|NT|NU)\b/)?.[1] ||
    Object.entries(provinces).find(([name]) =>
      lower.split(/[,;]/).some((part) => part.trim() === name),
    )?.[1] ||
    null;
  const us =
    /\b(?:United States|USA|U\.S\.?A?\.?)\b/i.test(original_text) ||
    /,\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)(?:\s|,|$)/.test(
      original_text,
    );
  const country = /\bCanada\b/i.test(original_text)
    ? 'Canada'
    : us
      ? 'United States'
      : province
        ? 'Canada'
        : /\bPoland\b/i.test(original_text)
          ? 'Poland'
          : null;
  return {
    original_text,
    city: original_text.includes(',')
      ? original_text.split(',')[0].trim()
      : null,
    province,
    country,
  };
}
