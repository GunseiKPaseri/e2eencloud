import { UUIDshort, uuidv7 } from 'tinyserver/deps.ts';

const translator = UUIDshort();

export const uniqueSequentialKey = () => translator.fromUUID(uuidv7());

export const uniqueKey = () => translator.new();
