import { atom } from 'jotai';

export interface Difficulty {
  name: 'EASY' | 'MEDIUM' | 'HARD';
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  EASY: { name: 'EASY', rows: 10, cols: 9, mines: 10 },
  MEDIUM: { name: 'MEDIUM', rows: 16, cols: 16, mines: 40 },
  HARD: { name: 'HARD', rows: 16, cols: 32, mines: 100 },
};

// State atoms
export const difficultyAtom = atom<Difficulty>(DIFFICULTIES.EASY);
export const mineCountAtom = atom<number>(10);
export const timerAtom = atom<string>('00:00');
export const gameOverAtom = atom<boolean>(false);
export const gameWinAtom = atom<boolean>(false);

// Action atoms (to trigger resets/difficulty changes from UI)
export const resetTriggerAtom = atom<number>(0);
