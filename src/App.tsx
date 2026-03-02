import { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  Layout,
  ModalProvider,
  ThemeProvider,
  ToastProvider,
  Typography,
  Button,
} from '@imspdr/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: FC = () => {
  const basename = process.env.NODE_ENV === 'production' ? '/template-project' : '/';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ModalProvider>
            <BrowserRouter basename={basename}>
              <AppLayout />
            </BrowserRouter>
          </ModalProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const HeaderControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StatusWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const AppLayout: FC = () => {
  const navigate = useNavigate();
  const [currentDiff, setDifficulty] = useAtom(difficultyAtom);
  const setResetTrigger = useSetAtom(resetTriggerAtom);
  const [mineCount] = useAtom(mineCountAtom);
  const [timer] = useAtom(timerAtom);

  const middleContent = (
    <HeaderControls>
      {Object.values(DIFFICULTIES).map((diff) => (
        <Button
          key={diff.name}
          variant={currentDiff.name === diff.name ? 'contained' : 'outlined'}
          size="sm"
          color="primary.1"
          onClick={() => setDifficulty(diff)}
        >
          {diff.name === 'EASY' ? '쉬움' : diff.name === 'MEDIUM' ? '보통' : '어려움'}
        </Button>
      ))}
      <Button
        variant="contained"
        size="sm"
        color="danger.1"
        onClick={() => setResetTrigger((prev) => prev + 1)}
      >
        재시작
      </Button>
    </HeaderControls>
  );

  const rightContent = (
    <StatusWrapper>
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
      title="지뢰찾기"
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
