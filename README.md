# Find Jiroi (지뢰찾기)

`Find Jiroi`는 `@imspdr/ui` 디자인 시스템을 기반으로 한 현대적이고 깔끔한 지뢰찾기 게임입니다. React와 TypeScript를 사용하여 구현되었으며, 모바일과 PC 환경 모두에서 최적화된 사용자 경험을 제공합니다.

## 🕹 주요 기능

-   **다양한 난이도**: EASY(9x10), MEDIUM(16x16), HARD(32x16/16x32) 모드 제공
-   **모바일 최적화**: 
    -   모바일 가로 해상도 한계를 고려하여 HARD 모드 시 자동으로 세로형(16x32) 레이아웃 전환
    -   우클릭이 불가능한 터치 환경을 위해 **0.5초 롱 프레스** 지뢰 깃발 설치 기능 지원
-   **반응형 디자인**: `@imspdr/ui`의 Slate(Grey/Zinc) 테마를 사용하여 다크/라이트 모드 지원 및 무채색 중심의 미니멀한 UI
-   **성능 최적화**: `React.memo`와 독립적인 셀 컴포넌트 관리를 통해 대형 맵에서도 부드러운 렌더링 성능 보장

## 🚀 시작하기

1.  의존성 설치:
    ```bash
    yarn install
    ```
2.  개발 서버 실행:
    ```bash
    yarn dev
    ```
3.  빌드:
    ```bash
    yarn build
    ```

## 📂 프로젝트 구조

-   `src/components/JiroiGame/`: 게임 핵심 로직 및 UI 컴포넌트
    -   `index.tsx`: 메인 게임 컨테이너
    -   `MinesweeperCell.tsx`: 메모이제이션된 개별 셀 컴포넌트
    -   `useMinesweeper.ts`: 게임 로직 커스텀 훅
    -   `styled.ts`: Emotion 기반 스타일 정의
-   `src/store/`: `jotai`를 이용한 전역 게임 상태 관리
-   `src/pages/`: 페이지 구성 요소

## 🛠 사용된 기술

-   **Core**: React 18, TypeScript
-   **Style**: Emotion (Styled Components), `@imspdr/ui`
-   **State**: Jotai
-   **Build**: Webpack 5, Babel
-   **Router**: React Router 7

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.
