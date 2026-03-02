import styled from '@emotion/styled';

/* ── PC Widget wrapper ── */

export const WidgetContainer = styled.div`
  background: var(--imspdr-background-1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid var(--imspdr-background-3);
  width: 420px;
  height: 480px;
`;

export const ControlBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--imspdr-background-3);
  flex-shrink: 0;
`;

export const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--imspdr-foreground-1);
`;

/** JiroiGame이 들어갈 영역 — 나머지 세로 공간을 모두 차지 */
export const GameBox = styled.div`
  flex: 1;
  min-height: 0;
`;

/* ── Mobile Widget (simple bomb icon tile) ── */

export const MobileWidgetContainer = styled.div`
  background: var(--imspdr-background-1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.1s ease;
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  aspect-ratio: 1;
  border: 1px solid var(--imspdr-background-3);

  &:active {
    transform: scale(0.95);
  }
`;

export const MobileIcon = styled.span`
  font-size: 28px;
  line-height: 1;
`;

export const MobileLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: var(--imspdr-foreground-3);
  margin-top: 4px;
  letter-spacing: 0.05em;
`;
