import styled from "styled-components";

// Used for wrapping a page component
export const Screen = styled.div`
  background-color: var(--primary);
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Screen2 = styled.div`
  background-color: var(--primary);
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

// Used for providing space between components
export const SpacerXSmall = styled.div`
  height: 8px;
  width: 8px;
`;

// Used for providing space between components
export const SpacerSmall = styled.div`
  height: 16px;
  width: 16px;
`;

// Used for providing space between components
export const SpacerMedium = styled.div`
  height: 24px;
  width: 24px;
`;

// Used for providing space between components
export const SpacerLarge = styled.div`
  height: 32px;
  width: 32px;
`;

// Used for providing a wrapper around a component
export const Container = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: ${({ fd }) => (fd ? fd : "column")};
  justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
  align-items: ${({ ai }) => (ai ? ai : "flex-start")};
  background-color: ${({ test }) => (test ? "pink" : "none")};
  width: 100%;
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
`;

export const Container2 = styled.div
  `
    display: flex;
    flex: ${({ flex }) => (flex ? flex : 0)};
    flex-direction: ${({ fd }) => (fd ? fd : "column")};
    justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
    align-items: ${({ ai }) => (ai ? ai : "flex-start")};
    background-color: ${({ test }) => (test ? "pink" : "none")};
    background-image: ${({ image }) => (image ? `url(${image})` : "none")};
    background-size: 114%;
    background-position: center;
    background-repeat: no-repeat;

    @media (max-width: 767px) {
      flex: none;
      height: 500px;
      width: 100%;
    }
  `

export const Container3 = styled.div
  `
    display: flex;
    flex: ${({ flex }) => (flex ? flex : 0)};
    flex-direction: ${({ fd }) => (fd ? fd : "column")};
    justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
    align-items: ${({ ai }) => (ai ? ai : "flex-start")};
    background-color: ${({ test }) => (test ? "pink" : "none")};
    background-image: ${({ image }) => (image ? `url(${image})` : "none")};
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;

    @media (max-width: 767px) {
      height: 500px;
      width: 100%;
    }
  `

export const TextTitle = styled.p`
  color: var(--primary-text);
  font-size: 33px;
  font-weight: bold;
  line-height: 1.6;
`;

export const TextSubTitle = styled.p`
  color: var(--primary-text);
  font-size: 18px;
  line-height: 1.6;
`;

export const TextDescription = styled.p`
  color: var(--primary-text);
  font-size: 16px;
  line-height: 1.6;
`;

export const TextDescription2 = styled.p`
  color: var(--primary-text);
  font-size: 16px;
  line-height: 1.6;
  cursor: pointer;
`;

export const StyledClickable = styled.div`
  :active {
    opacity: 0.6;
  }
`;
