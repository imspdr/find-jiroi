import { FC, useCallback, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  Layout,
  ModalProvider,
  ThemeProvider,
  ToastProvider,
  Typography,
  Button,
  useTheme,
  useDeviceType,
} from '@imspdr/ui';
import { useAtom, useSetAtom } from 'jotai';
import {
  difficultyAtom,
  mineCountAtom,
  timerAtom,
  resetTriggerAtom,
  DIFFICULTIES
} from './store/game';
import HomePage from './pages/Home';
import styled from '@emotion/styled';


const App: FC = () => {
  const basename = process.env.NODE_ENV === 'production' ? '/find-jiroi' : '/';

  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>
          <BrowserRouter basename={basename}>
            <AppLayout />
          </BrowserRouter>
        </ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

const HeaderControls = styled.div<{ isPc: boolean }>`
  display: flex;
  gap: ${({ isPc }) => (isPc ? '8px' : '4px')};
  align-items: center;
`;

const StatusWrapper = styled.div<{ isPc: boolean }>`
  display: flex;
  gap: ${({ isPc }) => (isPc ? '16px' : '8px')};
  align-items: center;
`;

const AppLayout: FC = () => {
  const navigate = useNavigate();
  const { isPc } = useDeviceType();
  const [currentDiff, setDifficulty] = useAtom(difficultyAtom);
  const setResetTrigger = useSetAtom(resetTriggerAtom);
  const [mineCount] = useAtom(mineCountAtom);
  const [timer] = useAtom(timerAtom);

  const handleDifficultyChange = useCallback((diff: typeof DIFFICULTIES[keyof typeof DIFFICULTIES]) => {
    if (diff.name === 'HARD' && !isPc) {
      setDifficulty({ ...diff, rows: 32, cols: 16 });
    } else {
      setDifficulty(diff);
    }
  }, [isPc, setDifficulty]);

  // Adjust current difficulty if isPc changes and it's HARD
  useEffect(() => {
    if (currentDiff.name === 'HARD') {
      if (isPc && currentDiff.cols === 16) {
        setDifficulty(DIFFICULTIES.HARD);
      } else if (!isPc && currentDiff.cols === 32) {
        setDifficulty({ ...DIFFICULTIES.HARD, rows: 32, cols: 16 });
      }
    }
  }, [isPc, currentDiff, setDifficulty]);

  const middleContent = (
    <HeaderControls isPc={isPc}>
      {Object.values(DIFFICULTIES).map((diff) => (
        <Button
          key={diff.name}
          variant={currentDiff.name === diff.name ? 'contained' : 'outlined'}
          size="sm"
          color="primary.1"
          onClick={() => handleDifficultyChange(diff)}
          style={{ minWidth: isPc ? '60px' : '36px', padding: isPc ? undefined : '0 4px' }}
        >
          {isPc
            ? (diff.name === 'EASY' ? '쉬움' : diff.name === 'MEDIUM' ? '보통' : '어려움')
            : (diff.name === 'EASY' ? 'E' : diff.name === 'MEDIUM' ? 'M' : 'D')}
        </Button>
      ))}
      <Button
        variant="contained"
        size="sm"
        color="danger.1"
        onClick={() => setResetTrigger((prev) => prev + 1)}
        style={{ minWidth: isPc ? undefined : '36px' }}
      >
        {isPc ? '재시작' : 'R'}
      </Button>
    </HeaderControls>
  );

  const rightContent = (
    <StatusWrapper isPc={isPc}>
      <Typography variant="body" level={2} bold>
        🚩 {mineCount}
      </Typography>
      <Typography variant="body" level={2} bold>
        ⏱ {timer}
      </Typography>
    </StatusWrapper>
  );

  return (
    <Layout
      title={isPc ? "지뢰찾기" : ""}
      onHomeClick={() => navigate('/')}
      middleContent={middleContent}
      rightContent={rightContent}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
