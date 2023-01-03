import styled from "styled-components";
import CDimg from "../assets/images/vinyl.png";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {useState} from "react";
import CloseImg from "../assets/images/icon_close.svg";
import publicJs from "../utils/publicJs";

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
  width: 100%;
  box-sizing: border-box;
  position: relative;

  video{
    background: #000;
    width: 100%;
  }
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

const AudioBg = styled.div`
  //background: #f00;
  width: 100%;
  height: 70vh;
position: relative;
  .music-player-container {
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    display: inline-block;
    height: 400px;
    position: absolute;
    min-width: 680px;
    left: 45%;
    top: 50%;
  }
  .music-player-container:after {
    -webkit-filter: blur(8px);
    filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.8);
    bottom: -2px;
    content: " ";
    display: block;
    height: 10px;
    left: 19px;
    position: absolute;
    transform: rotate(-3deg);
    width: 70%;
    z-index: 0;
  }

  .music-player {
    background-color: #222;
    height: 400px;

    position: absolute;
    text-align: right;
    width: 680px;
    z-index: 3;
  }

  .player-content-container {
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    top: 50%;
    position: relative;
    padding-right: 250px;
  }

  .artist-name {
    font-size: 28px;
    font-family: "Poppins-Bold";
    font-weight: normal;
    margin-bottom: 10px;
  }

  .album-title {
    font-weight: 200;
    font-size: 14px;
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .song-title {
    font-size: 18px;
    font-weight: 200;
    margin-bottom: 30px;
    font-family: "Poppins-Light";
    opacity: 0.8;
  }

  .album {
    box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.65);
    height: 315px;
    margin-left: 450px;
    margin-top: 27px;
    position: relative;
    width: 315px;
    z-index: 10;
  }

  .album-art {
    background: ${props => `#fff url(${props.bg}) center/cover no-repeat`};
    height: 315px;
    position: relative;
    width: 315px;
    z-index: 10;
  }

  .vinyl {
    -webkit-animation: spin 2s linear infinite;
    -moz-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
    -webkit-transition: all 500ms;
    -moz-transition: all 500ms;
    transition: all 500ms;
    background-image: ${props => `url(${CDimg}), url(${props.bg})`};
    background-position: center, center;
    background-size: cover, 40% auto;
    background-repeat: no-repeat;
    border-radius: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    height: 300px;
    left: 0;
    position: absolute;
    top: 5px;
    width: 300px;
    z-index: 5;
    will-change: transform, left;
  }
  .is-playing .vinyl {
    left: 52%;
  }

  
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @-moz-keyframes spin {
    0% {
      -moz-transform: rotate(0deg);
    }
    100% {
      -moz-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`
const AudioPlay = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  bottom: -50px;
  z-index: 999;
  .rhap_container{
    background: #000;
    padding: 10px 40px;
    border-radius: 50px;
  }
`

export default function AudioBox(props){

    const {handleClose,item} = props;
    const [playing,setPlaying] = useState(false);

    const handlePlay = () => {
        setPlaying(true)
    }
    const handleRemove = () => {
        setPlaying(false)
    }


    return <BgBox>
        <ContentBox>
            <CloseBox onClick={()=>handleClose()}>    <img src={CloseImg} alt=""/></CloseBox>
            <AudioBg bg={item.cover}>
                <div className={playing?"music-player-container is-playing":"music-player-container"}>
                    <div className="music-player">
                        <div className="player-content-container">
                            <h1 className="artist-name">{item.title}</h1>
                            <h2 className="album-title">{publicJs.dateFormat(item.created_at)}</h2>
                            <h3 className="song-title">{item.description}</h3>
                        </div>
                        <AudioPlay>
                            <AudioPlayer
                                controls
                                src="http://downsc.chinaz.net/Files/DownLoad/sound1/201906/11582.mp3"
                                onPlay={() => handlePlay()}
                                onPause={()=>handleRemove()}
                            />
                        </AudioPlay>
                    </div>

                    <div className="album">
                        <div className="album-art" />
                        <div className="vinyl" />
                    </div>
                </div>
            </AudioBg>

        </ContentBox>
    </BgBox>
}