import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore -- node --experimental-strip-types needs the .ts extension; tsc does not allow it without allowImportingTsExtensions
import { digitsFromValue, formatTrPhone, isValidTrPhone, nationalDigits, toE164, toWhatsappDigits } from '../src/lib/phone.ts';

describe('Turkish phone helpers', () => {
  test('partial values keep the +90 prefix out of the national number', () => {
    assert.equal(digitsFromValue('+905'), '5');
    assert.equal(digitsFromValue('+90532'), '532');
    assert.equal(digitsFromValue('+905324194151'), '5324194151');
  });
  test('legacy spellings are read correctly', () => {
    for (const v of ['0532 419 41 51', '+90 532 419 41 51', '905324194151', '5324194151']) {
      assert.equal(nationalDigits(v), '5324194151', v);
      assert.equal(toE164(v), '+905324194151', v);
    }
  });
  test('validation', () => {
    assert.equal(isValidTrPhone('+905324194151', { mobile: true }), true);
    assert.equal(isValidTrPhone('+902163650000', { mobile: true }), false);
    assert.equal(isValidTrPhone('+902163650000'), true);
    assert.equal(isValidTrPhone('+90532419'), false);
    assert.equal(isValidTrPhone('+901003650000'), false);
  });
  test('display and wa.me formats', () => {
    assert.equal(formatTrPhone('0216 365 00 00'), '+90 216 365 00 00');
    assert.equal(toWhatsappDigits('+905324194151'), '905324194151');
    assert.equal(toWhatsappDigits('123'), '');
  });
});
