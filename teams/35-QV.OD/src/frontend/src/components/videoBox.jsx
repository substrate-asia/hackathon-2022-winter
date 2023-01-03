import styled from "styled-components";
import CloseImg from "../assets/images/icon_close.svg";
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import publicJs from "../utils/publicJs";
import VideoDemo from "../assets/images/ddd/caminandes-llamigos.mp4";
import {Preview} from "../api/apiHttp";

const BgBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  position: absolute;
  box-sizing: border-box;
  width:calc(100vw - 250px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`
const ContentBox = styled.div`
    padding: 40px;
  width: 75%;
  box-sizing: border-box;
  position: relative;


`

const VideoBoxBg = styled.div`
  video{
    background: #000;
    width: 100%;
  }
`
const TipBox = styled.div`
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  .title {
    font-size: 24px;
    color: #ffffff;
    margin: 0;
    font-family: "Poppins-SemiBold";
  }
  .desc{
    margin-top: 20px;
    font-size: 14px;
    opacity: 0.7;
    height: 3em;
    overflow-y: auto;
  }
  .info-section{
    label {
      color: #727475;
      font-size:12px;
      margin-right: 10px;
    }
    span {
      font-weight: 700;
      font-size: 12px;
      font-family: "Poppins-Light";
    }
  }
    background: #000;
`
const CloseBox = styled.div`
    position: absolute;
  right: 40px;
  top: 10px;
  z-index: 999;
  cursor: pointer;
  img{
    width: 20px;
  }
`

const VideoPlugin = (props) => {
    const videoNode = useRef(null);
    const [player, setPlayer] = useState(null);
    useEffect(() => {
        if (videoNode.current) {
            const _player = videojs(videoNode.current, props);
            setPlayer(_player);
            return () => {
                if (player !== null) {
                    player.dispose();
                }
            };
        }
    }, []);

    return (
        <VideoBoxBg data-vjs-player>
            <video ref={videoNode} className="video-js" />
        </VideoBoxBg>
    );
};

export default function VideoBox(props){

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const {handleClose,item} = props;
    // useEffect(()=>{
    //     console.log(item)
    //     const getVideo = async() =>{
    //         let res = await Preview(item.id,item.entry_fid)
    //     }
    //     getVideo()
    // },[item])

    const userKey = localStorage.getItem("user-key");

    const play = {
        fill: true,
        fluid: true,
        autoplay: true,
        controls: true,
        preload: "metadata",
        sources: [
            {
                // src: `${BASE_URL}/media/${userKey}/${item.entry_fid}`,
                src: `${BASE_URL}/media/${userKey}/${item.entry_fid}`,
                type: "application/x-mpegURL"

                // src: VideoDemo,
                // type: "video/mp4"
            }
        ]
    };

    return <BgBox>
        <ContentBox>
            <CloseBox onClick={()=>handleClose()}>
                <img src={CloseImg} alt=""/>
            </CloseBox>
            <VideoPlugin {...play} />
            <TipBox>
                <div>
                    <div className="title">{item.title}</div>
                    <div className="info-section">
                        <label>Date &amp; Time</label>
                        <span>{publicJs.dateFormat(item.created_at)}</span>
                    </div>
                    <div className="desc">{item.description}
                    </div>
                </div>

            </TipBox>
        </ContentBox>
    </BgBox>
}