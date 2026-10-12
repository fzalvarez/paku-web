export interface SaveCardPayload {
  token_id: string;
  expiration_month: number;
  expiration_year: number;
}

export function isValidCardExpiration(month: string, year: string): boolean {
  if (!/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return false;

  const expirationMonth = Number(month);
  const expirationYear = Number(year);

  return (
    expirationMonth >= 1 &&
    expirationMonth <= 12 &&
    expirationYear >= 1000 &&
    expirationYear <= 9999
  );
}

export function buildSaveCardPayload(
  tokenId: string,
  month: string,
  year: string
): SaveCardPayload {
  if (!isValidCardExpiration(month, year)) {
    throw new Error("Ingresa un mes y año de vencimiento válidos.");
  }

  return {
    token_id: tokenId,
    expiration_month: Number(month),
    expiration_year: Number(year),
  };
}
