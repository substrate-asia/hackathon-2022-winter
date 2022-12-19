/* eslint-disable jsx-a11y/alt-text */
import React, { createRef } from "react";
import { Link } from "react-router-dom";
import { Pagination } from 'antd';
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
  Menu,
  Input,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import AccountSelector from "../AccountSelector";
import { SubstrateContextProvider, useSubstrateState } from "../substrate-lib";
import { DeveloperConsole } from "../substrate-lib/components";
import Floor from "../Floor";
import '../rxd/css.css';
function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState();
  
  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );

  const message = (errObj) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  );

  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
      <AccountSelector />
     
      </Sticky>
      
      <Container
        style={{
          backgroundSize: "100% 100%",
          //图片的路径
          // borderColor: "#fff",
          // paddingTop: "1em",
          // paddingBottom: "1em",
          width: "100%",
          height: "579px",
        //   marginRight: "-20px",
        //   backgroundColor:'#40454E',
          display: "flex",
        //   alignItems: "center",
          justifyContent: "center", //中间留白
        //   color: "#fff",
          fontFamily: "Arial",
          fontWeight: "400",
        //   textAlign: "center",
        }}
      >
        {/* 头 */}
         
        <div style={{
        
         width:'73%'}}>

		<div style={{float:'left',
         fontWeight:'bold',
         fontSize:'30px',
         marginTop:'60px',
         
         width:'100%'
         }}>BROWSE  RECORDS</div>
        <div style={{
         marginTop:'110px',
         color:'#9C9C9C',
        borderBottom: '2px solid #E2E2E2',
        paddingBottom:'10px',
        fontSize:'15px',
         width:'100%',
         }}>
             <div style={{
                float:'left',
             }}> Subject </div>
            <div style={{
                marginLeft:'75%',
             }}>Browse Time </div>


            </div>

            
         <div    className="sfl" style={{
          float:"left",
         marginTop:'10px',
        //  color:'#E2E2E2',
         width:'100%',
         height:'110px'
         }}>
            <div style={{
                marginTop:'10px',
                paddingTop:'20px',
         paddingBottom:'20px',
            }}>
                    <div style={{
         fontWeight:'bold',
         fontSize:'20px',
        //  marginTop:'60px',
        float:"left",
         width:'70%',
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'16px',
         marginTop:'10px',
       color:'#9C9C9C',
         width:'70%',
         float:"left",
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
                         
                        float:"left",
                        height:'110px', 
                        marginLeft:'5%',
                        fontWeight:'bold',
                    }}>A month ago</div>
            </div>
         </div>
         <div    className="sfl" style={{
          float:"left",
         marginTop:'10px',
        //  color:'#E2E2E2',
         width:'100%',
         height:'110px'
         }}>
            <div style={{
                marginTop:'10px',
                paddingTop:'20px',
         paddingBottom:'20px',
            }}>
                    <div style={{
         fontWeight:'bold',
         fontSize:'20px',
        //  marginTop:'60px',
        float:"left",
         width:'70%',
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'16px',
         marginTop:'10px',
       color:'#9C9C9C',
         width:'70%',
         float:"left",
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
                         
                        float:"left",
                        height:'110px', 
                        marginLeft:'5%',
                        fontWeight:'bold',
                    }}>A month ago</div>
            </div>
         </div>
         <div    className="sfl" style={{
          float:"left",
         marginTop:'10px',
        //  color:'#E2E2E2',
         width:'100%',
         height:'110px'
         }}>
            <div style={{
                marginTop:'10px',
                paddingTop:'20px',
         paddingBottom:'20px',
            }}>
                    <div style={{
         fontWeight:'bold',
         fontSize:'20px',
        //  marginTop:'60px',
        float:"left",
         width:'70%',
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'16px',
         marginTop:'10px',
       color:'#9C9C9C',
         width:'70%',
         float:"left",
         }}>
                    An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends
                    </div>
                    <div style={{
                         
                        float:"left",
                        height:'110px', 
                        marginLeft:'5%',
                        fontWeight:'bold',
                    }}>A month ago</div>
            </div>
         </div>
           <Pagination defaultCurrent={1} total={50} defaultPageSize={5}  style={{
               marginTop: "70px",
               marginBottom: "30px",
               
            }}/>
		</div>
      
      </Container>
      {/* <Sticky context={contextRef}>
      </Sticky> */}
      <Floor />
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
