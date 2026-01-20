export const hashString = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const buildIdempotencyKey = async (parts: string[]): Promise<string> => {
  const payload = parts.filter(Boolean).join('|');
  return hashString(payload);
};
