import styled from '@emotion/styled';

export const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
`;

export const Grid = styled.div<{ rows: number; cols: number; cellSize: number }>`
  display: grid;
  grid-template-rows: repeat(${({ rows }) => rows}, ${({ cellSize }) => cellSize}px);
  grid-template-columns: repeat(${({ cols }) => cols}, ${({ cellSize }) => cellSize}px);
  gap: 1px;
  background-color: var(--imspdr-background-2);
  padding: 1px;
  border-radius: 8px;
  overflow: hidden;
`;

export const Cell = styled.div<{ revealed: boolean; cellSize: number; neighborCount?: number }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: ${({ cellSize }) => Math.max(cellSize * 0.6, 12)}px;
  border-radius: 4px;
  
  background-color: ${({ revealed }) =>
    revealed ? 'var(--imspdr-background-1)' : 'var(--imspdr-background-3)'};
  
  touch-action: none;
  transition: background-color 0.1s ease;
  
  color: ${({ neighborCount }) => {
    if (!neighborCount) return 'inherit';
    const colors = [
      'transparent',
      '#3498db', '#2ecc71', '#e74c3c',
      '#9b59b6', '#f1c40f', '#1abc9c',
      '#e67e22', '#34495e'
    ];
    return colors[neighborCount] || 'inherit';
  }};

  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

  &:active {
    filter: none;
    outline: none;
  }
  
  @media (hover: hover) {
    &:hover {
      filter: brightness(0.9);
    }
  }
`;

export const StatusMessage = styled.div<{ win: boolean }>`
  position: absolute;
  top: 120px;
  font-size: 48px;
  font-weight: bold;
  color: ${({ win }) => (win ? 'var(--imspdr-success-1)' : 'var(--imspdr-danger-1)')};
  pointer-events: none;
  z-index: 10;
`;
export const GameIcon = styled.span`
  line-height: 1;
`;
