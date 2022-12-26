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
         }}>GOVERNANCE</div>
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
                float:'left',
              
               marginLeft:'28%',
             }}>Governance Type </div>
             <div style={{
                float:'left',
              
               marginLeft:'5%',
             }}>Description </div>
              <div style={{
                float:'left',
              
               marginLeft:'15%',
             }}>Favor </div>
             <div style={{
                float:'left',
              
               marginLeft:'5%',
             }}>Oppose </div>
            
            <div style={{
               marginLeft:'82%',

             }}>Status </div>


            </div>

            
         <div    className="sfl" style={{
          float:"left",
         marginTop:'10px',
        //  color:'#E2E2E2',
         width:'100%',
         height:'110px'
         }}>
            <div style={{
                // marginTop:'10px',
                paddingTop:'20px',
         paddingBottom:'20px',
            }}>
                    <div style={{
         fontWeight:'bold',
         fontSize:'15px',
        //  marginTop:'60px',
        float:"left",
         width:'30%',
         }}>
          <div>An Overview of Blockchain Technology: Architecture, Consensus, and Future Trends</div>
          <div> <div  style={{
            marginTop:'10px'
        }}>
          <img
           
            src={`${process.env.PUBLIC_URL}/assets/headimg.png`}
            style={{
                display:"flex",
                width:'25px',
                height:'25px', 
                float:' left',
                
            }}
            />
        </div>
             <div style={{
                display:"flex",
                width:'150px',
                height:'30px', 
                float:' left',
            marginLeft:'25px',
            lineHeight: "30px",
           
            fontSize:'15px',
            }}>0x6804...be5c</div></div>   
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'18px',
        //  marginTop:'60px',
        float:"left",       
        marginLeft:'2%',
         width:'10%',
         }}>
                    Substitution
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'15px',
        //  marginTop:'60px',
        float:"left",       
        marginLeft:'3%',
         width:'17%',
         }}>
                    This content has been for a longtime and should be replaced witha new one
                    </div>
                    <div style={{
         fontWeight:'bold',
         fontSize:'20px',
        //  marginTop:'60px',
        float:"left",       
        marginLeft:'4%',
         width:'5%',
         }}>
                    <div style={{
                    
                    }}>372</div>
                   
                    </div>
                    
                    <div style={{
                        float:"left",
                        height:'110px', 
                        marginLeft:'3%',
                        fontSize:'20px',
                        fontWeight:'bold',
                    }}>21</div>
                    <div style={{
                        // float:"left",
                        height:'110px', 
                        marginLeft:'82%',
                        // fontWeight:'bold',
                        fontSize:'18px',
                    }}>
                     < div 
                     style={{
                      float:"left",
                      height:'110px', 
                     
                      // fontWeight:'bold',
                      fontSize:'18px',
                  }}>  Progress</ div>
                     < div 
                     style={{
                      float:"left",
                      // height:'110px', 
                     color:'#058305',
                     marginLeft:'6%',
                      // fontWeight:'bold',
                      fontSize:'18px',
                      borderBottom: '2px solid #058305',
                  }}>  Favor</ div>
                    
                    < div 
                     style={{
                      float:"left",
                      // height:'110px', 
                     color:'#C60C0C',
                     marginLeft:'6%',
                      // fontWeight:'bold',
                      fontSize:'18px',
                      borderBottom: '2px solid #C60C0C',
                  }}>  Oppse</ div>
                    
                    
                    
                    </div>
            </div>
         </div>
         
         
           <Pagination defaultCurrent={1} total={50} defaultPageSize={5}  style={{
               marginTop: "75px",
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
