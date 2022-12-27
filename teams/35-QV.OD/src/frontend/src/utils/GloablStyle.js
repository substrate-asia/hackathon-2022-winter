import { createGlobalStyle } from "styled-components";
import "../assets/scss/fonts.scss";
import "../assets/scss/rhtBox.scss"

const GlobalStyle = createGlobalStyle`
   
    *{
      font-family: "Poppins-Regular";
      padding: 0;
      margin: 0;
      scrollbar-width: none!important;
      &::-webkit-scrollbar {
        width: 0 ;
        display: none;
      }
    }
    body{
      background:#222;
      color: #fff;
    }
    .title{
    }
    ul,li,dl,dt,dd,p{
     padding: 0;
      margin: 0;
      list-style: none;
    }
    .form-control{
      background: #2e3134;
      border: 0;
      color: #Fff;
      &:focus{
        outline: none;
        box-shadow:none;
        background: #2e3134;
        color: #Fff;
      }
    }
    label{
      color: #727475;
    }
    .btn-flat {
      background-color: #4F8AFE;
      color: white;
      height: 40px;
      font-size: 14px;
      &:focus{
        outline: none;
      }
      &:hover{
        background: #2b60d8;
        color: white;
        border: 0;
      }
      &:disabled{
        cursor: not-allowed;
      }
    }
`;
export default GlobalStyle
