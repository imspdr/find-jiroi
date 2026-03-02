import { FC, useRef, useMemo, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { difficultyAtom, gameOverAtom, gameWinAtom } from '../../store/game';
import { useMinesweeper } from './useMinesweeper';
import { GameContainer, Grid, Cell, StatusMessage } from './styled';

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
      const padding = 80;
      const availableW = width - padding;
      const availableH = height - padding;

      const size = Math.min(
        Math.floor(availableW / difficulty.cols),
        Math.floor(availableH / difficulty.rows),
        40
      );
      setCellSize(Math.max(size, 25));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [difficulty]);

  return (
    <GameContainer ref={containerRef} onContextMenu={(e) => e.preventDefault()}>
      {gameOver && (
        <StatusMessage win={gameWin}>
          {gameWin ? '승리!' : '💀 게임 오버'}
        </StatusMessage>
      )}
      <Grid rows={difficulty.rows} cols={difficulty.cols} cellSize={cellSize}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              revealed={cell.revealed}
              neighborCount={cell.revealed ? cell.neighborCount : undefined}
              onClick={() => {
                if (cell.revealed) {
                  chord(r, c);
                } else {
                  revealCell(r, c);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleFlag(r, c);
              }}
            >
              {cell.revealed ? (
                cell.isMine ? (
                  '💣'
                ) : cell.neighborCount > 0 ? (
                  cell.neighborCount
                ) : (
                  ''
                )
              ) : cell.flagged ? (
                '🚩'
              ) : (
                ''
              )}
            </Cell>
          ))
        )}
      </Grid>
    </GameContainer>
  );
};

export default JiroiGame;
