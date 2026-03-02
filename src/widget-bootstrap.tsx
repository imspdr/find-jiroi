import React from 'react';
import ReactDOM from 'react-dom/client';
import styled from '@emotion/styled';
import { ThemeProvider } from '@imspdr/ui';
import { MiniMinesweeperWidget, MiniMinesweeperMobileWidget } from './exports/MiniMinesweeperWidget';

const PreviewContainer = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const SectionLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <PreviewContainer>
          <Section>
            <SectionLabel>PC — MiniMinesweeperWidget</SectionLabel>
            <MiniMinesweeperWidget />
          </Section>
          <Section>
            <SectionLabel>Mobile — MiniMinesweeperMobileWidget</SectionLabel>
            <div style={{ width: '80px' }}>
              <MiniMinesweeperMobileWidget />
            </div>
          </Section>
        </PreviewContainer>
      </ThemeProvider>
    </React.StrictMode>
  );
}
