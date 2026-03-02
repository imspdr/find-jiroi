import { FC, useRef, useMemo, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { difficultyAtom, gameOverAtom, gameWinAtom } from '../../store/game';
import { useMinesweeper } from './useMinesweeper';
import { GameContainer, Grid, StatusMessage } from './styled';
import MinesweeperCell from './MinesweeperCell';

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
      setCellSize(Math.max(size, 16));
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
            <MinesweeperCell
              key={`${r}-${c}`}
              cell={cell}
              cellSize={cellSize}
              onReveal={revealCell}
              onFlag={toggleFlag}
              onChord={chord}
            />
          ))
        )}
      </Grid>
    </GameContainer>
  );
};

export default JiroiGame;
