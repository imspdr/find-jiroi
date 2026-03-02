import { FC } from 'react';
import styled from '@emotion/styled';
import JiroiGame from '../../components/JiroiGame';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px); /* Subtract Header height if any, or adjust as needed */
  width: 100%;
  overflow: hidden;
`;

const HomePage: FC = () => {
  return (
    <Container>
      <JiroiGame />
    </Container>
  );
};

export default HomePage;
