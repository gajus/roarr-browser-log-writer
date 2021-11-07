import type {
  logLevels,
} from 'roarr';

type LogLevelName = keyof typeof logLevels;

export type LogMethods = { [key in LogLevelName]: (...data: unknown[]) => void };

export type Storage = {
  getItem: (name: string) => string | null,
  setItem: (name: string, value: string) => void,
}
