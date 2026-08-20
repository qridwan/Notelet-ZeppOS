import { up as up001 } from './001_init';

export type Migration = {
  version: number;
  up: string;
};

// Ordered, append-only. Each entry's `version` becomes the schema's
// PRAGMA user_version once applied — never edit a migration once it has shipped;
// add a new one instead.
export const migrations: Migration[] = [{ version: 1, up: up001 }];
