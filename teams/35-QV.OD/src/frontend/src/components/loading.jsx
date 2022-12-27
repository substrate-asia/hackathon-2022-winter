import styled from "styled-components";

const Box = styled.div`
    position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`
const Loader = styled.div`
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
    -webkit-box-reflect: below 1px linear-gradient(transparent, #0005);

  &:hover {
    background: #2b60d8;
    box-shadow: 0 0 5px #2b60d8,
    0 0 25px #2b60d8,
    0 0 50px #2b60d8,
    0 0 200px #2b60d8;
  }

   span {
    position: absolute;
    display: block;
  }

  span:nth-child(1) {
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: linear-gradient(90deg, transparent, #2b60d8);
    animation: animate1 1s linear infinite;
    animation-delay: 0;
  }

  @keyframes animate1 {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  span:nth-child(3) {
    bottom: 0;
    left: -100%;
    width: 100%;
    height: 40px;
    background: linear-gradient(270deg, transparent, #2b60d8);
    animation: animate3 1s linear infinite;
    animation-delay: 0;
  }

  @keyframes animate3 {
    0% {
      left: 100%;
    }

    100% {
      left: -100%;
    }
  }

  @keyframes animate1 {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  span:nth-child(2) {
    right: 0;
    top: -100%;
    width: 40px;
    height: 100%;
    background: linear-gradient(180deg, transparent, #2b60d8);
    animation: animate2 1s linear infinite;
    animation-delay: 0.5;
  }

  @keyframes animate2 {
    0% {
      top: -100%;
    }

    100% {
      top: 100%;
    }
  }

  span:nth-child(4) {
    left: 0;
    top: 100%;
    width: 40px;
    height: 100%;
    background: linear-gradient(0deg, transparent, #2b60d8);
    animation: animate4 1s linear infinite;
    animation-delay: 0.5s;
  }

  @keyframes animate4 {
    0% {
      top: 100%;
    }

    100% {
      top: -100%;
    }
  }
`

export default function Loading(){
    return <Box>
        <Loader>
            <span />
            <span />
            <span />
            <span />
        </Loader>
    </Box>
}