import { FC, useRef } from 'react';
import { GameContainer, CanvasWrapper } from './styled';
import { useMinesweeper } from './useMinesweeper';

const JiroiGame: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useMinesweeper(containerRef);

  return (
    <GameContainer>
      <CanvasWrapper ref={containerRef} id="jiroi-game-canvas" />
    </GameContainer>
  );
};

export default JiroiGame;
