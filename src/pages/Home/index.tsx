import { FC } from 'react';
import { Typography, Button } from '@imspdr/ui';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  gap: 20px;
`;

const HomePage: FC = () => {
  return (
    <Container>
      <Typography variant="title" level={1} color="primary.1">
        Template Project
      </Typography>
      <Typography variant="body" level={1}>
        Template Project.
      </Typography>
      <Button variant="contained" color="primary.1" onClick={() => alert('Start coding!')}>
        Get Started
      </Button>
    </Container>
  );
};

export default HomePage;
