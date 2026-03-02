import styled from '@emotion/styled';

export const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  user-select: none;
  position: relative;
`;

export const Viewport = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y; /* Allow 1-finger scroll; pinch handled by JS */
  display: flex;
  justify-content: safe center;
  align-items: safe flex-start;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--imspdr-background-3);
    border-radius: 4px;
    border: 2px solid var(--imspdr-background-2);
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const ZoomWrapper = styled.div`
  display: inline-block;
  margin: 0 auto;
  min-width: max-content;
  min-height: max-content;
`;

export const Grid = styled.div<{ rows: number; cols: number; cellSize: number }>`
  display: grid;
  grid-template-rows: repeat(${({ rows }) => rows}, ${({ cellSize }) => cellSize}px);
  grid-template-columns: repeat(${({ cols }) => cols}, ${({ cellSize }) => cellSize}px);
  gap: 1px;
  background-color: var(--imspdr-background-2);
  padding: 1px;
  border-radius: 8px;
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
  
  touch-action: manipulation; /* Allow scroll through but precise tap */
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
