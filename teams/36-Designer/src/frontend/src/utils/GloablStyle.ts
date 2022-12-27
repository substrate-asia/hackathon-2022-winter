import { createGlobalStyle } from "styled-components";
import "../assets/scss/fonts.scss";
import "../assets/scss/style.scss";

const GlobalStyle = createGlobalStyle`
   
    *{
      padding: 0;
      margin: 0;
      font-family: "Lato-Regular";
      scrollbar-width: none!important;
      &::-webkit-scrollbar {
        width: 0 ;
        display: none;
      }
    }
    body,html{
      background:#141417;
      color: #fff;
    }
    .title{
      font-family: "black";
    }
    .mainColor{
      background: #edbd55;
    }
    ul,li,dl,dt,dd{
     padding: 0;
      margin: 0;
      list-style: none;
    }
    .tableBox{
      margin-top: 30px;
      table{
        width: 100%;
        th{
          font-family: "Lato-Regular";
          padding:8px;
        }
        td{
          padding: 8px;
          background: #040404;
          border: 1px solid #141417;
          font-size: 13px;
          opacity: 0.6;
        }
      }
    }
`;
export default GlobalStyle
