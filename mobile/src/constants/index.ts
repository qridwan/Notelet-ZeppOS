export const DATABASE_NAME = 'notelet.db';

// SRS FR-MOB-001 / FR-MOB-004: enforced input limits.
export const FOLDER_NAME_MAX_LENGTH = 100;
export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_DESCRIPTION_MAX_LENGTH = 20000;

// SRS #46: dataset assumptions the MVP is tuned for (not a hard cap).
export const RECOMMENDED_MAX_FOLDERS = 100;
export const RECOMMENDED_MAX_NOTES = 1000;
