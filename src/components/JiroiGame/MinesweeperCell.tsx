import { FC, memo, useRef } from 'react';
import { CellData } from './useMinesweeper';
import { Cell, GameIcon } from './styled';

interface MinesweeperCellProps {
  cell: CellData;
  cellSize: number;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
  onChord: (r: number, c: number) => void;
}

const MinesweeperCell: FC<MinesweeperCellProps> = memo(({
  cell,
  cellSize,
  onReveal,
  onFlag,
  onChord
}) => {
  const { r, c, revealed, flagged, isMine, neighborCount } = cell;
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactionHandledRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (revealed) return;
    interactionHandledRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      onFlag(r, c);
      interactionHandledRef.current = true;
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!interactionHandledRef.current) {
      if (revealed) {
        onChord(r, c);
      } else {
        onReveal(r, c);
      }
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (interactionHandledRef.current) return;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    onFlag(r, c);
    interactionHandledRef.current = true;
  };

  return (
    <Cell
      revealed={revealed}
      cellSize={cellSize}
      neighborCount={revealed ? neighborCount : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
    >
      {revealed ? (
        isMine ? (
          <GameIcon>💣</GameIcon>
        ) : neighborCount > 0 ? (
          neighborCount
        ) : (
          ''
        )
      ) : flagged ? (
        <GameIcon>🚩</GameIcon>
      ) : (
        ''
      )}
    </Cell>
  );
});

MinesweeperCell.displayName = 'MinesweeperCell';

export default MinesweeperCell;
