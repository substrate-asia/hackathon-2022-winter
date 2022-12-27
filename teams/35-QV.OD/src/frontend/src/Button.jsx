import LikeImg from "./assets/images/icon_add_person.svg"
import styled from "styled-components";
import {useSubstrate} from "./api/contracts";


const Box = styled.div`
  .container {
    -webkit-transition: all 600ms cubic-bezier(0.81,-0.12, 0.64, 0.99);
    transition: all 600ms cubic-bezier(0.81,-0.12, 0.64, 0.99);
  }

  .main-box {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 260px;
    height: 60px;
    box-sizing: border-box;
    background: #2e3134;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    padding: 0 30px;
    -webkit-transition: all 800ms cubic-bezier(0.82, -0.12, 0.4, 1.18);
    transition: all 800ms cubic-bezier(0.82, -0.12, 0.4, 1.18);
  }

  .box-content {
    width: 100%;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
  }

  .box-content .text {
    position: relative;
    left: -28px;
    margin-left: 32px;
  }

  .text .titleName {
    font-weight: bold;
    font-size: 14px;
    color: #fff;
  }
  .dots div {
    width: 6px;
    height: 6px;
    background: #4F8AFE;
    margin: 3px;
    border-radius: 100%;
  }

  .blue-bg {
    display: none;
    position: absolute;
    right: 400px;
    z-index: 1;
    width: 100px;
    height: 60px;
    background: #4F8AFE;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.25);
    border-radius: 0 24px 24px 0;
  }

  .box-content::after {
    content: '';
    /*display: none;
    */
    opacity: 0;
    position: absolute;
    right: 20px;
    z-index: -1;
    width: 80px;
    height: 60px;
    background: #4F8AFE;
    border-radius: 0 8px 8px 0;
    -webkit-transition: all 700ms cubic-bezier(0.82, -0.02, 0.4, 1.18);
    transition: all 700ms cubic-bezier(0.82, -0.02, 0.4, 1.18);
  }

  .main-box:hover .box-content::after {
    opacity: 1;
    position: absolute;
    z-index: -1;
    -webkit-transform: translateX(120px);
    transform: translateX(120px);
  }

  .box-content::before {
    content: '';
    opacity: 0;
    position: absolute;
    right: -50px;
    /* z-index:1; */
    width: 162px;
    height: 140px;
    background: url(${LikeImg}) no-repeat 30px center;
    background-size: 35px;

    -webkit-transition: all 700ms cubic-bezier(0.82, -0.02, 0.4, 1.18);
    transition: all 700ms cubic-bezier(0.82, -0.02, 0.4, 1.18);
  }

  .main-box:hover .box-content::before {
    opacity: 1;
    position: absolute;
    /* z-index: 1; */
    -webkit-transform: translateX(120px) scale(.7);
    transform: translateX(120px) scale(.7);
  }

  .dots div {
    -webkit-transition: all 500ms cubic-bezier(0.65, 0.51, 0.37, 1.02);
    transition: all 500ms cubic-bezier(0.65, 0.51, 0.37, 1.02);
  }

  .main-box:hover .dots div:nth-child(1) {
    -webkit-transform: translateY(9px);
    transform: translateY(9px);
    /* transition: all 500ms cubic-bezier(0.65, 0.51, 0.37, 1.02); */
  }

  .main-box:hover .dots div:nth-child(2) {
    -webkit-transform: scale(3);
    transform: scale(3);
    /* transition: all 500ms cubic-bezier(0.65, 0.51, 0.37, 1.02); */
  }

  .main-box:hover .dots div:nth-child(3) {
    -webkit-transform: translateY(-9px);
    transform: translateY(-9px);
    /* transition: all 500ms cubic-bezier(0.65, 0.51, 0.37, 1.02); */
  }

  .container:hover {
    /* z-index: 2; */
    -webkit-transform: translateX(-30px);
    transform: translateX(-30px);
  }
  .box-content img{
    width: 24px;
  }
`

export default function ButtonAccount(){
    const {dispatch} = useSubstrate();
    const handleStep = () =>{
        dispatch({ type: 'STEP', payload: 2 });
    }

    return <Box>
        <div className="container">
            <div className="main-box" onClick={()=>handleStep()}>
                <div className="box-content">
                    <div className="text">
                        <p className="titleName">Create new account</p>
                    </div>
                    <div className="dots">
                        <div />
                        <div />
                        <div />
                    </div>
                </div>

            </div>

        </div>
    </Box>
}