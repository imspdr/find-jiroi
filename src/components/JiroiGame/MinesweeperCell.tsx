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
    // Always reset so the previous state doesn't bleed into the next interaction
    interactionHandledRef.current = false;

    if (revealed) {
      // Revealed cells have no long-press action; chord fires on pointerUp
      return;
    }

    // 마우스 우클릭(button=2)은 contextMenu로 처리하므로 타이머 불필요
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

    // 마우스 우클릭은 contextMenu 이벤트로 처리하므로 여기서 스킵
    if (e.pointerType === 'mouse' && e.button === 2) return;

    if (!interactionHandledRef.current) {
      if (revealed) {
        onChord(r, c);
      } else if (flagged) {
        onFlag(r, c);
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

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    interactionHandledRef.current = true; // 취소된 인터랙션은 처리된 것으로 표시
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 우클릭은 항상 플래그 토글 (revealed 여부 무관)
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
