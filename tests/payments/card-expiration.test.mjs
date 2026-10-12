import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSaveCardPayload,
  isValidCardExpiration,
} from "../../lib/payments/card-expiration.ts";

test("builds the wallet payload from the token ID and original expiration", () => {
  const payload = buildSaveCardPayload("tkn_test_example", "09", "2031");

  assert.deepEqual(payload, {
    token_id: "tkn_test_example",
    expiration_month: 9,
    expiration_year: 2031,
  });
  assert.deepEqual(Object.keys(payload).sort(), [
    "expiration_month",
    "expiration_year",
    "token_id",
  ]);
});

test("accepts valid expiration values", () => {
  assert.equal(isValidCardExpiration("1", "2031"), true);
  assert.equal(isValidCardExpiration("12", "9999"), true);
});

test("rejects missing or out-of-range months", () => {
  for (const month of ["", "0", "13", "1.5", "abc"]) {
    assert.equal(isValidCardExpiration(month, "2031"), false, month);
    assert.throws(() => buildSaveCardPayload("tkn_test_example", month, "2031"));
  }
});

test("rejects missing or non-four-digit years", () => {
  for (const year of ["", "31", "02031", "abcd", "0000"]) {
    assert.equal(isValidCardExpiration("09", year), false, year);
    assert.throws(() => buildSaveCardPayload("tkn_test_example", "09", year));
  }
});
