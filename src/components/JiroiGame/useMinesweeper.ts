import { useEffect, useRef, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { useAtom, useSetAtom } from 'jotai';
import {
  difficultyAtom,
  mineCountAtom,
  timerAtom,
  gameOverAtom,
  gameWinAtom,
  resetTriggerAtom,
  Difficulty
} from '../../store/game';
import { useTheme } from '@imspdr/ui';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborCount: number;
  container: Container;
  bg: Graphics;
  content?: Graphics | Text;
}

export const useMinesweeper = (containerRef: React.RefObject<HTMLDivElement>) => {
  const { theme } = useTheme();
  const appRef = useRef<Application | null>(null);

  const [difficulty, setDifficulty] = useAtom(difficultyAtom);
  const setMineCount = useSetAtom(mineCountAtom);
  const setTimer = useSetAtom(timerAtom);
  const setGameOver = useSetAtom(gameOverAtom);
  const setGameWin = useSetAtom(gameWinAtom);
  const [resetTrigger] = useAtom(resetTriggerAtom);

  const gameRef = useRef<{
    rootContainer: Container;
    gridContainer: Container;
    grid: Cell[][];
    firstClick: boolean;
    startTime: number;
    timerInterval?: any;
    statusText?: Text;
    rows: number;
    cols: number;
    mineTotal: number;
    cellSize: number;
    gameOver: boolean;
  } | null>(null);

  // Helper to convert theme color string to number for Pixi
  const getThemeColor = useCallback((colorToken: string) => {
    // This is a simple mapper for the purpose of the demo
    // In a real app, imspdr/ui might provide these as hex strings
    const colors: Record<string, number> = {
      'background.1': theme === 'light' ? 0xffffff : 0x0f172a,
      'background.2': theme === 'light' ? 0xf1f5f9 : 0x1e293b,
      'foreground.1': theme === 'light' ? 0x0f172a : 0xf8fafc,
      'primary.1': 0x14b8a6, // Teal 500
      'danger.1': 0xef4444, // Red 500
      'success.1': 0x10b981, // Emerald 500
      'warning.1': 0xf59e0b, // Amber 500
    };
    return colors[colorToken] || 0x000000;
  }, [theme]);

  const drawCellBg = useCallback((g: Graphics, revealed: boolean) => {
    if (!gameRef.current) return;
    const { cellSize } = gameRef.current;
    const padding = 1;
    g.clear();

    const bgColor = revealed ? getThemeColor('background.2') : getThemeColor('background.1');
    const strokeColor = theme === 'light' ? 0xdddddd : 0x334155;

    g.roundRect(padding, padding, cellSize - padding * 2, cellSize - padding * 2, 4)
      .fill(bgColor)
      .stroke({ width: 1, color: strokeColor });
  }, [getThemeColor, theme]);

  const getNeighbors = useCallback((r: number, c: number): Cell[] => {
    if (!gameRef.current) return [];
    const { rows, cols, grid } = gameRef.current;
    const neighbors: Cell[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push(grid[nr][nc]);
        }
      }
    }
    return neighbors;
  }, []);

  const showStatus = useCallback((msg: string, colorToken: string) => {
    if (!gameRef.current || !appRef.current) return;
    if (gameRef.current.statusText) {
      appRef.current.stage.removeChild(gameRef.current.statusText);
    }
    const { width } = containerRef.current!.getBoundingClientRect();
    const statusText = new Text({
      text: msg,
      style: {
        fill: getThemeColor(colorToken),
        fontSize: 48,
        fontWeight: 'bold',
        stroke: { color: theme === 'light' ? 0xffffff : 0x000000, width: 6 }
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = width / 2;
    statusText.y = 120;
    appRef.current.stage.addChild(statusText);
    gameRef.current.statusText = statusText;
  }, [containerRef, getThemeColor, theme]);

  const revealMines = useCallback(() => {
    if (!gameRef.current) return;
    const { grid, cellSize } = gameRef.current;
    grid.flat().forEach(cell => {
      if (cell.isMine && !cell.flagged) {
        drawCellBg(cell.bg, true);
        const mine = new Graphics()
          .circle(cellSize / 2, cellSize / 2, cellSize / 3)
          .fill(getThemeColor('danger.1'))
          .circle(cellSize / 2, cellSize / 2, cellSize / 8)
          .fill(0x000000);
        cell.container.addChild(mine);
      } else if (!cell.isMine && cell.flagged) {
        const x = new Text({ text: 'X', style: { fill: getThemeColor('danger.1'), fontSize: cellSize * 0.6 } });
        x.anchor.set(0.5);
        x.x = cellSize / 2;
        x.y = cellSize / 2;
        cell.container.addChild(x);
      }
    });
  }, [drawCellBg, getThemeColor]);

  const revealRecursive = useCallback((r: number, c: number) => {
    if (!gameRef.current) return;
    const { rows, cols, grid, cellSize } = gameRef.current;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged || cell.isMine) return;

    cell.revealed = true;
    drawCellBg(cell.bg, true);

    if (cell.neighborCount > 0) {
      const colors = [
        0,
        0x3498db, 0x2ecc71, 0xe74c3c,
        0x9b59b6, 0xf1c40f, 0x1abc9c,
        0xe67e22, 0x34495e
      ];
      const text = new Text({
        text: cell.neighborCount.toString(),
        style: {
          fill: colors[cell.neighborCount],
          fontSize: cellSize * 0.6,
          fontWeight: 'bold'
        }
      });
      text.anchor.set(0.5);
      text.x = cellSize / 2;
      text.y = cellSize / 2;
      cell.container.addChild(text);
      cell.content = text;
    } else {
      getNeighbors(r, c).forEach(n => revealRecursive(n.r, n.c));
    }
  }, [drawCellBg, getNeighbors]);

  const checkWinCondition = useCallback(() => {
    if (!gameRef.current) return;
    const { grid } = gameRef.current;
    const hidden = grid.flat().filter(c => !c.isMine && !c.revealed).length;
    if (hidden === 0) {
      gameRef.current.gameOver = true;
      setGameOver(true);
      setGameWin(true);
      clearInterval(gameRef.current.timerInterval);
      showStatus('🎉 승리!', 'success.1');
    }
  }, [showStatus, setGameOver, setGameWin]);

  const gameLost = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.gameOver = true;
    setGameOver(true);
    setGameWin(false);
    clearInterval(gameRef.current.timerInterval);
    showStatus('💀 게임 오버', 'danger.1');
  }, [showStatus, setGameOver, setGameWin]);

  const handleReveal = useCallback((cell: Cell) => {
    if (cell.flagged || cell.revealed) return;
    if (cell.isMine) {
      revealMines();
      gameLost();
    } else {
      revealRecursive(cell.r, cell.c);
      checkWinCondition();
    }
  }, [revealMines, gameLost, revealRecursive, checkWinCondition]);

  const toggleFlag = useCallback((cell: Cell) => {
    if (cell.revealed || !gameRef.current) return;
    const { cellSize, mineTotal, grid } = gameRef.current;
    cell.flagged = !cell.flagged;

    if (cell.flagged) {
      const flag = new Graphics()
        .poly([{ x: cellSize / 2, y: cellSize / 4 }, { x: cellSize * 0.75, y: cellSize * 0.4 }, { x: cellSize / 2, y: cellSize * 0.55 }])
        .fill(getThemeColor('warning.1'))
        .rect(cellSize / 2 - 1, cellSize / 4, 2, cellSize / 2)
        .fill(getThemeColor('foreground.1'));
      cell.container.addChild(flag);
      cell.content = flag;
    } else {
      if (cell.content) {
        cell.container.removeChild(cell.content);
        cell.content = undefined;
      }
    }

    const currentFlags = grid.flat().filter(c => c.flagged).length;
    setMineCount(mineTotal - currentFlags);
  }, [getThemeColor, setMineCount]);

  const handleChord = useCallback((cell: Cell) => {
    if (!cell.revealed || cell.neighborCount === 0) return;
    const neighbors = getNeighbors(cell.r, cell.c);
    const flags = neighbors.filter(n => n.flagged).length;
    if (flags === cell.neighborCount) {
      neighbors.forEach(n => handleReveal(n));
    }
  }, [getNeighbors, handleReveal]);

  const onCellClick = useCallback((cell: Cell, e: any) => {
    if (!gameRef.current || gameRef.current.gameOver) return;
    // PixiJS event button: 0=left, 1=middle, 2=right
    if (e.button === 2 || (e.nativeEvent && e.nativeEvent.shiftKey) || e.shiftKey) {
      toggleFlag(cell);
      return;
    }
    if (cell.revealed) {
      handleChord(cell);
      return;
    }
    handleReveal(cell);
  }, [toggleFlag, handleChord, handleReveal]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !appRef.current || !gameRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    appRef.current.renderer.resize(width, height);

    const boardW = gameRef.current.cols * gameRef.current.cellSize;
    const boardH = gameRef.current.rows * gameRef.current.cellSize;

    // Header height in Pixi is gone, so start at 20 or center vertically
    gameRef.current.gridContainer.x = Math.max(0, (width - boardW) / 2);
    gameRef.current.gridContainer.y = Math.max(20, (height - boardH) / 2);

    if (gameRef.current.statusText) {
      gameRef.current.statusText.x = width / 2;
    }
  }, [containerRef]);

  const calculateLayout = useCallback(() => {
    if (!containerRef.current || !gameRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = 40;

    const availableW = width - padding;
    const availableH = height - padding;

    gameRef.current.cellSize = Math.min(
      Math.floor(availableW / gameRef.current.cols),
      Math.floor(availableH / gameRef.current.rows),
      40
    );
    if (gameRef.current.cellSize < 25) gameRef.current.cellSize = 25;
  }, [containerRef]);

  const startTimer = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.startTime = Date.now();
    gameRef.current.timerInterval = setInterval(() => {
      if (!gameRef.current) return;
      const elapsed = Math.floor((Date.now() - gameRef.current.startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      setTimer(`${m}:${s}`);
    }, 1000);
  }, [setTimer]);

  const reset = useCallback(() => {
    if (!gameRef.current || !appRef.current || !containerRef.current) return;

    gameRef.current.rows = difficulty.rows;
    gameRef.current.cols = difficulty.cols;
    gameRef.current.mineTotal = difficulty.mines;

    gameRef.current.gameOver = false;
    setGameOver(false);
    setGameWin(false);
    setMineCount(difficulty.mines);
    setTimer('00:00');

    clearInterval(gameRef.current.timerInterval);

    gameRef.current.gridContainer.removeChildren();
    if (gameRef.current.statusText) {
      appRef.current.stage.removeChild(gameRef.current.statusText);
      gameRef.current.statusText = undefined;
    }

    calculateLayout();

    // Create Grid
    gameRef.current.grid = [];
    for (let r = 0; r < gameRef.current.rows; r++) {
      gameRef.current.grid[r] = [];
      for (let c = 0; c < gameRef.current.cols; c++) {
        const cellContainer = new Container();
        cellContainer.x = c * gameRef.current.cellSize;
        cellContainer.y = r * gameRef.current.cellSize;

        const bg = new Graphics();
        drawCellBg(bg, false);
        cellContainer.addChild(bg);

        const cell: Cell = {
          r, c,
          isMine: false,
          revealed: false,
          flagged: false,
          neighborCount: 0,
          container: cellContainer,
          bg: bg
        };

        cellContainer.eventMode = 'static';
        cellContainer.on('pointerdown', (e) => onCellClick(cell, e));

        gameRef.current.gridContainer.addChild(cellContainer);
        gameRef.current.grid[r][c] = cell;
      }
    }

    // Setup Mines
    let placed = 0;
    const { rows, cols, mineTotal, grid } = gameRef.current;
    const corners = [[0, 0], [0, cols - 1], [rows - 1, 0], [rows - 1, cols - 1]];

    while (placed < mineTotal) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const isCorner = corners.some(([cr, cc]) => cr === r && cc === c);
      if (!isCorner && !grid[r][c].isMine) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          grid[r][c].neighborCount = getNeighbors(r, c).filter(n => n.isMine).length;
        }
      }
    }

    // Pre-reveal corners
    corners.forEach(([r, c]) => revealRecursive(r, c));
    startTimer();
    handleResize();
  }, [difficulty, calculateLayout, drawCellBg, getNeighbors, handleResize, onCellClick, revealRecursive, startTimer, setGameOver, setGameWin, setMineCount, setTimer]);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const app = new Application();

    app.init({
      width,
      height,
      backgroundColor: getThemeColor('background.1'),
      backgroundAlpha: 0, // Transparent background to show container bg
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (!containerRef.current) return;
      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      const rootContainer = new Container();
      const gridContainer = new Container();

      app.stage.addChild(rootContainer);
      rootContainer.addChild(gridContainer);

      gameRef.current = {
        rootContainer,
        gridContainer,
        grid: [],
        firstClick: true,
        startTime: 0,
        rows: difficulty.rows,
        cols: difficulty.cols,
        mineTotal: difficulty.mines,
        cellSize: 40,
        gameOver: false,
      };

      app.canvas.oncontextmenu = (e) => e.preventDefault();
      reset();

      window.addEventListener('resize', handleResize);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (appRef.current) {
        clearInterval(gameRef.current?.timerInterval);
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, []); // Only init once

  // React to difficulty or resetTrigger changes
  useEffect(() => {
    if (gameRef.current) {
      reset();
    }
  }, [difficulty, resetTrigger]);

  // React to theme changes (update cell backgrounds)
  useEffect(() => {
    if (gameRef.current && gameRef.current.grid) {
      gameRef.current.grid.flat().forEach(cell => {
        drawCellBg(cell.bg, cell.revealed);
      });
    }
  }, [theme, drawCellBg]);

  return { reset };
};
