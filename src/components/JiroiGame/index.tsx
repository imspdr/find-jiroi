import { FC, useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { difficultyAtom, gameOverAtom, gameWinAtom } from '../../store/game';
import { useMinesweeper } from './useMinesweeper';
import { GameContainer, Grid, StatusMessage, Viewport, ZoomWrapper } from './styled';
import MinesweeperCell from './MinesweeperCell';

const JiroiGame: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { grid, revealCell, toggleFlag, chord } = useMinesweeper();
  const [difficulty] = useAtom(difficultyAtom);
  const [gameOver] = useAtom(gameOverAtom);
  const [gameWin] = useAtom(gameWinAtom);

  const [baseCellSize, setBaseCellSize] = useState(40);
  const [zoom, setZoom] = useState(1);

  // Refs for pinch tracking (using refs to avoid closure issues in native listeners)
  const zoomStartRef = useRef<{ dist: number; zoom: number } | null>(null);
  const isPinchingRef = useRef(false);

  // ── Cell size from container dimensions ──────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const padding = 60;
      const availableW = width - padding;
      const availableH = height - padding;

      const size = Math.min(
        Math.floor(availableW / difficulty.cols),
        Math.floor(availableH / difficulty.rows),
        40
      );
      setBaseCellSize(Math.max(size, 16));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [difficulty]);

  // ── Native touch event listeners (passive: false so we can preventDefault) ──
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        setZoom((prev) => {
          zoomStartRef.current = { dist, zoom: prev };
          return prev;
        });
        isPinchingRef.current = true;
      } else {
        isPinchingRef.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && zoomStartRef.current) {
        e.preventDefault(); // Prevent native browser zoom/scroll on pinch
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const delta = dist / zoomStartRef.current.dist;
        const newZoom = Math.min(Math.max(zoomStartRef.current.zoom * delta, 0.5), 5);
        setZoom(newZoom);
        // Update reference dist for continuous tracking
        zoomStartRef.current = { dist, zoom: newZoom };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        zoomStartRef.current = null;
        if (e.touches.length === 0) {
          isPinchingRef.current = false;
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false }); // non-passive to call preventDefault
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const cellSize = useMemo(() => Math.floor(baseCellSize * zoom), [baseCellSize, zoom]);

  // Wrap reveal/flag/chord to block actions fired during a pinch gesture
  const handleReveal = useCallback((r: number, c: number) => {
    if (!isPinchingRef.current) revealCell(r, c);
  }, [revealCell]);

  const handleFlag = useCallback((r: number, c: number) => {
    if (!isPinchingRef.current) toggleFlag(r, c);
  }, [toggleFlag]);

  const handleChord = useCallback((r: number, c: number) => {
    if (!isPinchingRef.current) chord(r, c);
  }, [chord]);

  return (
    <GameContainer
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
    >
      {gameOver && (
        <StatusMessage win={gameWin}>
          {gameWin ? '승리!' : '💀 게임 오버'}
        </StatusMessage>
      )}
      <Viewport ref={viewportRef}>
        <ZoomWrapper>
          <Grid rows={difficulty.rows} cols={difficulty.cols} cellSize={cellSize}>
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <MinesweeperCell
                  key={`${r}-${c}`}
                  cell={cell}
                  cellSize={cellSize}
                  onReveal={handleReveal}
                  onFlag={handleFlag}
                  onChord={handleChord}
                />
              ))
            )}
          </Grid>
        </ZoomWrapper>
      </Viewport>
    </GameContainer>
  );
};

export default JiroiGame;
