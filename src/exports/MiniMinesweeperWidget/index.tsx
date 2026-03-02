import React, { useCallback, useEffect, useMemo } from 'react';
import { createStore, Provider, useAtom, useSetAtom } from 'jotai';
import { Button, Typography, useDeviceType } from '@imspdr/ui';
import JiroiGame from '@/components/JiroiGame';
import {
  difficultyAtom,
  mineCountAtom,
  timerAtom,
  resetTriggerAtom,
  DIFFICULTIES,
} from '@/store/game';
import {
  WidgetContainer,
  ControlBar,
  StatusBar,
  GameBox,
  MobileWidgetContainer,
  MobileIcon,
  MobileLabel,
} from './styled';

/* ──────────────────────────────────────────────────────────
   헤더에 있던 컨트롤 버튼들 (난이도 선택 + 재시작 + 지뢰/타이머)
   — App.tsx의 middleContent / rightContent 로직과 동일
────────────────────────────────────────────────────────── */
const GameControls: React.FC = () => {
  const { isPc } = useDeviceType();
  const [currentDiff, setDifficulty] = useAtom(difficultyAtom);
  const setResetTrigger = useSetAtom(resetTriggerAtom);
  const [mineCount] = useAtom(mineCountAtom);
  const [timer] = useAtom(timerAtom);

  const handleDifficultyChange = useCallback(
    (diff: typeof DIFFICULTIES[keyof typeof DIFFICULTIES]) => {
      if (diff.name === 'HARD' && !isPc) {
        setDifficulty({ ...diff, rows: 32, cols: 16 });
      } else {
        setDifficulty(diff);
      }
    },
    [isPc, setDifficulty]
  );

  // isPc가 바뀌면 HARD 난이도 방향 전환 (App.tsx와 동일)
  useEffect(() => {
    if (currentDiff.name === 'HARD') {
      if (isPc && currentDiff.cols === 16) {
        setDifficulty(DIFFICULTIES.HARD);
      } else if (!isPc && currentDiff.cols === 32) {
        setDifficulty({ ...DIFFICULTIES.HARD, rows: 32, cols: 16 });
      }
    }
  }, [isPc, currentDiff, setDifficulty]);

  return (
    <ControlBar>
      {Object.values(DIFFICULTIES).map((diff) => (
        <Button
          key={diff.name}
          variant={currentDiff.name === diff.name ? 'contained' : 'outlined'}
          size="sm"
          color="primary.1"
          onClick={() => handleDifficultyChange(diff)}
          style={{ minWidth: '48px', padding: '0 6px' }}
        >
          {diff.name === 'EASY' ? '쉬움' : diff.name === 'MEDIUM' ? '보통' : '어려움'}
        </Button>
      ))}
      <Button
        variant="contained"
        size="sm"
        color="danger.1"
        onClick={() => setResetTrigger((prev) => prev + 1)}
        style={{ minWidth: '52px' }}
      >
        재시작
      </Button>
      <StatusBar>
        <Typography variant="body" level={3} bold>🚩 {mineCount}</Typography>
        <Typography variant="body" level={3} bold>⏱ {timer}</Typography>
      </StatusBar>
    </ControlBar>
  );
};

/* ──────────────────────────────────────────────────────────
   PC: 난이도 선택 + 재시작 버튼 + 전체 게임 로직 그대로
   독립 jotai store로 메인 앱과 state 완전 격리
────────────────────────────────────────────────────────── */
export const MiniMinesweeperWidget: React.FC = () => {
  const miniStore = useMemo(() => createStore(), []);

  return (
    <Provider store={miniStore}>
      <WidgetContainer onContextMenu={(e) => e.preventDefault()}>
        <GameControls />
        <GameBox>
          <JiroiGame />
        </GameBox>
      </WidgetContainer>
    </Provider>
  );
};

/* ──────────────────────────────────────────────────────────
   모바일: 클릭 → find-jiroi 이동 아이콘 타일 (그대로 유지)
────────────────────────────────────────────────────────── */
export const MiniMinesweeperMobileWidget: React.FC = () => {
  const handleClick = () => {
    window.location.href = 'https://imspdr.github.io/find-jiroi';
  };

  return (
    <MobileWidgetContainer onClick={handleClick}>
      <MobileIcon>💣</MobileIcon>
      <MobileLabel>지뢰찾기</MobileLabel>
    </MobileWidgetContainer>
  );
};

export default MiniMinesweeperWidget;
