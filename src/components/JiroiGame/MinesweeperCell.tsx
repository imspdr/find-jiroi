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
    interactionHandledRef.current = false;

    if (revealed) {
      return;
    }

    if (e.pointerType === 'mouse' && e.button === 2) return;

    longPressTimerRef.current = setTimeout(() => {
      onFlag(r, c);
      interactionHandledRef.current = true;
    }, 200);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.pointerType === 'mouse' && e.button === 2) return;

    if (!interactionHandledRef.current) {
      if (revealed) {
        onChord(r, c);
      } else if (flagged) {
        onFlag(r, c);
      } else {
        onReveal(r, c);
      }
      interactionHandledRef.current = true;
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    interactionHandledRef.current = true;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!interactionHandledRef.current) {
      onFlag(r, c);
      interactionHandledRef.current = true;
    }
  };

  return (
    <Cell
      revealed={revealed}
      cellSize={cellSize}
      neighborCount={revealed ? neighborCount : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
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
