import { FC, useRef, useMemo, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { difficultyAtom, gameOverAtom, gameWinAtom } from '../../store/game';
import { useMinesweeper } from './useMinesweeper';
import { GameContainer, Grid, Cell, StatusMessage, GameIcon } from './styled';

const JiroiGame: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { grid, revealCell, toggleFlag, chord } = useMinesweeper();
  const [difficulty] = useAtom(difficultyAtom);
  const [gameOver] = useAtom(gameOverAtom);
  const [gameWin] = useAtom(gameWinAtom);

  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const padding = 10;
      const availableW = width - padding;
      const availableH = height - padding;

      const size = Math.min(
        Math.floor(availableW / difficulty.cols),
        Math.floor(availableH / difficulty.rows),
        40
      );
      setCellSize(Math.max(size, 20));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [difficulty]);

  const longPressTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const interactionHandledRef = useRef<Record<string, boolean>>({});

  return (
    <GameContainer ref={containerRef} onContextMenu={(e) => e.preventDefault()}>
      {gameOver && (
        <StatusMessage win={gameWin}>
          {gameWin ? '승리!' : '💀 게임 오버'}
        </StatusMessage>
      )}
      <Grid rows={difficulty.rows} cols={difficulty.cols} cellSize={cellSize}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const cellKey = `${r}-${c}`;
            return (
              <Cell
                key={cellKey}
                revealed={cell.revealed}
                cellSize={cellSize}
                neighborCount={cell.revealed ? cell.neighborCount : undefined}
                onPointerDown={(e) => {
                  if (cell.revealed) return;
                  interactionHandledRef.current[cellKey] = false;
                  const timer = setTimeout(() => {
                    toggleFlag(r, c);
                    interactionHandledRef.current[cellKey] = true;
                  }, 500);
                  longPressTimerRef.current[cellKey] = timer;
                }}
                onPointerUp={(e) => {
                  if (longPressTimerRef.current[cellKey]) {
                    clearTimeout(longPressTimerRef.current[cellKey]);
                    delete longPressTimerRef.current[cellKey];
                  }

                  if (!interactionHandledRef.current[cellKey]) {
                    if (cell.revealed) {
                      chord(r, c);
                    } else {
                      revealCell(r, c);
                    }
                  }
                }}
                onPointerLeave={(e) => {
                  if (longPressTimerRef.current[cellKey]) {
                    clearTimeout(longPressTimerRef.current[cellKey]);
                    delete longPressTimerRef.current[cellKey];
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (interactionHandledRef.current[cellKey]) return;

                  if (longPressTimerRef.current[cellKey]) {
                    clearTimeout(longPressTimerRef.current[cellKey]);
                    delete longPressTimerRef.current[cellKey];
                  }
                  toggleFlag(r, c);
                  interactionHandledRef.current[cellKey] = true;
                }}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    <GameIcon>💣</GameIcon>
                  ) : cell.neighborCount > 0 ? (
                    cell.neighborCount
                  ) : (
                    ''
                  )
                ) : cell.flagged ? (
                  <GameIcon>🚩</GameIcon>
                ) : (
                  ''
                )}
              </Cell>
            );
          })
        )}
      </Grid>
    </GameContainer>
  );
};

export default JiroiGame;
