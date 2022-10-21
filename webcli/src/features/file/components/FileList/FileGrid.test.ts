import { describe, test, expect } from 'vitest';
import { serializeTags, deserializeTags } from './FileGrid';

describe('serialize', () => {
  test('#serializeTags', () => {
    expect(serializeTags([])).toBe('');
    expect(serializeTags(['hoge'])).toBe('hoge');
    expect(serializeTags(['hoge', 'fuga'])).toBe('hoge|pfuga');
    expect(serializeTags(['hoge|', 'oho||ho'])).toBe('hoge|||poho||||ho');
  });

  test('#deserializeTags', () => {
    expect(deserializeTags('')).toEqual(['']);
    expect(deserializeTags('hoge')).toEqual(['hoge']);
    expect(deserializeTags('hoge|pfuga')).toEqual(['hoge', 'fuga']);
    expect(deserializeTags('hoge|||poho||||ho')).toEqual(['hoge|', 'oho||ho']);
  });
});
