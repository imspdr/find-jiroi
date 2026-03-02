import { useState, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  difficultyAtom,
  mineCountAtom,
  timerAtom,
  gameOverAtom,
  gameWinAtom,
  resetTriggerAtom,
} from '../../store/game';

export interface CellData {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborCount: number;
}

export const useMinesweeper = () => {
  const [difficulty] = useAtom(difficultyAtom);
  const setMineCount = useSetAtom(mineCountAtom);
  const setTimer = useSetAtom(timerAtom);
  const setGameOver = useSetAtom(gameOverAtom);
  const setGameWin = useSetAtom(gameWinAtom);
  const [resetTrigger] = useAtom(resetTriggerAtom);

  const [grid, setGrid] = useState<CellData[][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const getNeighbors = useCallback((r: number, c: number, rows: number, cols: number) => {
    const neighbors: { r: number; c: number }[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  }, []);

  const initializeGrid = useCallback(() => {
    const { rows, cols, mines } = difficulty;
    const newGrid: CellData[][] = [];

    // 1. Create empty grid
    for (let r = 0; r < rows; r++) {
      newGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        newGrid[r][c] = {
          r,
          c,
          isMine: false,
          revealed: false,
          flagged: false,
          neighborCount: 0,
        };
      }
    }

    // 2. Place mines (avoiding corners to guarantee some opening)
    let minesPlaced = 0;
    const corners = [[0, 0], [0, cols - 1], [rows - 1, 0], [rows - 1, cols - 1]];

    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const isCorner = corners.some(([cr, cc]) => cr === r && cc === c);

      if (!isCorner && !newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // 3. Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newGrid[r][c].isMine) {
          const neighbors = getNeighbors(r, c, rows, cols);
          newGrid[r][c].neighborCount = neighbors.filter(
            (n) => newGrid[n.r][n.c].isMine
          ).length;
        }
      }
    }

    // Initial reveal of corners
    const finalGrid = [...newGrid.map(row => [...row])];
    const reveal = (r: number, c: number, gridState: CellData[][]) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      const cell = gridState[r][c];
      if (cell.revealed || cell.flagged || cell.isMine) return;

      cell.revealed = true;
      if (cell.neighborCount === 0) {
        const neighbors = getNeighbors(r, c, rows, cols);
        neighbors.forEach((n) => reveal(n.r, n.c, gridState));
      }
    };

    corners.forEach(([r, c]) => reveal(r, c, finalGrid));

    setGrid(finalGrid);
    setIsGameOver(false);
    setStartTime(null);
  }, [difficulty, getNeighbors]);

  // Sync internal game state to global atoms to avoid "update during render" warnings
  useEffect(() => {
    if (grid.length === 0) return;
    setGameOver(isGameOver);

    const allRevealed = grid.every((row) =>
      row.every((cell) => cell.isMine || cell.revealed)
    );
    const hitMine = grid.flat().some(cell => cell.isMine && cell.revealed);

    if (allRevealed && !hitMine) {
      setGameWin(true);
    } else {
      setGameWin(false);
    }

    const flagCount = grid.flat().filter((c) => c.flagged).length;
    setMineCount(difficulty.mines - flagCount);
  }, [grid, isGameOver, difficulty.mines, setGameOver, setGameWin, setMineCount]);

  useEffect(() => {
    initializeGrid();
    setTimer('00:00');
  }, [initializeGrid, resetTrigger, setTimer]);

  useEffect(() => {
    let interval: any;
    if (startTime && !isGameOver) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        setTimer(`${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameOver, setTimer]);

  const revealCell = useCallback((r: number, c: number) => {
    if (isGameOver) return;

    setGrid((prev) => {
      const newGrid = prev.map((row) => row.map((cell) => ({ ...cell })));
      const cell = newGrid[r][c];

      if (cell.revealed || cell.flagged) return prev;

      if (!startTime) setStartTime(Date.now());

      if (cell.isMine) {
        // Game Over
        setIsGameOver(true);
        // Reveal all mines
        newGrid.forEach((row) =>
          row.forEach((cell) => {
            if (cell.isMine) cell.revealed = true;
          })
        );
        return newGrid;
      }

      const revealRecursive = (row: number, col: number) => {
        if (row < 0 || row >= difficulty.rows || col < 0 || col >= difficulty.cols) return;
        const target = newGrid[row][col];
        if (target.revealed || target.flagged || target.isMine) return;

        target.revealed = true;
        if (target.neighborCount === 0) {
          const neighbors = getNeighbors(row, col, difficulty.rows, difficulty.cols);
          neighbors.forEach((n) => revealRecursive(n.r, n.c));
        }
      };

      revealRecursive(r, c);

      // Check win condition
      const allRevealed = newGrid.every((row) =>
        row.every((cell) => cell.isMine || cell.revealed)
      );

      if (allRevealed) {
        setIsGameOver(true);
      }

      return newGrid;
    });
  }, [difficulty, isGameOver, getNeighbors, startTime]);

  const toggleFlag = useCallback((r: number, c: number) => {
    if (isGameOver) return;

    setGrid((prev) => {
      const cell = prev[r][c];
      if (cell.revealed) return prev;

      const newGrid = prev.map((row) => row.map((cell) => ({ ...cell })));
      newGrid[r][c].flagged = !newGrid[r][c].flagged;
      return newGrid;
    });
  }, [isGameOver]);

  const chord = useCallback((r: number, c: number) => {
    if (isGameOver) return;

    setGrid((prev) => {
      const cell = prev[r][c];
      if (!cell.revealed || cell.neighborCount === 0) return prev;

      const neighbors = getNeighbors(r, c, difficulty.rows, difficulty.cols);
      const flagCount = neighbors.filter((n) => prev[n.r][n.c].flagged).length;

      if (flagCount === cell.neighborCount) {
        const newGrid = prev.map((row) => row.map((cell) => ({ ...cell })));
        let hitMine = false;

        const revealRecursive = (row: number, col: number) => {
          const target = newGrid[row][col];
          if (target.revealed || target.flagged) return;

          if (target.isMine) {
            target.revealed = true; // Show the mine that was hit
            hitMine = true;
            return;
          }

          target.revealed = true;
          if (target.neighborCount === 0) {
            const ns = getNeighbors(row, col, difficulty.rows, difficulty.cols);
            ns.forEach((n) => revealRecursive(n.r, n.c));
          }
        };

        neighbors.forEach((n) => revealRecursive(n.r, n.c));

        if (hitMine) {
          setIsGameOver(true);
          newGrid.forEach((row) =>
            row.forEach((cell) => {
              if (cell.isMine) cell.revealed = true;
            })
          );
        } else {
          // Check win condition
          const allRevealed = newGrid.every((row) =>
            row.every((cell) => cell.isMine || cell.revealed)
          );

          if (allRevealed) {
            setIsGameOver(true);
          }
        }

        return newGrid;
      }

      return prev;
    });
  }, [difficulty.rows, difficulty.cols, getNeighbors, isGameOver]);

  return { grid, revealCell, toggleFlag, chord, initializeGrid };
};
