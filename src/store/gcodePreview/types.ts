import { AppFile } from '@/store/files/types'

export interface GcodePreviewState {
  moves: Move[];
  file?: AppFile;

  viewer: {
    showNextLayer: boolean;
    showPreviousLayer: boolean;
    showMoves: boolean;
    showExtrusions: boolean;
    showRetractions: boolean;
  };
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

export interface LayerPaths {
  moves: string;
  extrusions: string;
  retractions: Point[];
}

export interface Point {
  x: number;
  y: number;
}

export enum PositioningMode {
  Relative = 'relative',
  Absolute = 'absolute'
}
