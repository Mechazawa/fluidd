import { AppFile } from '@/store/files/types'

export interface GcodePreviewState {
  moves: Move[];
  file?: AppFile;
}

export interface LinearMove {
  x?: number;
  y?: number;
  z?: number;
  e?: number;
}

export interface ArcMove extends LinearMove {
  i?: number;
  j?: number;
  r?: number;
  direction: Rotation;
}

export type Move = LinearMove | ArcMove;

export enum Rotation {
  Clockwise = 'clockwise',
  CounterClockwise = 'counter-clockwise',
}
