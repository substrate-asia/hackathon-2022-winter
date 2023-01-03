import styled from "styled-components";
import '../assets/scss/rhtBox.scss';
import {useEffect,useState} from "react";
import anime from 'animejs/lib/anime.es.js';
import MoreImg from "../assets/images/icon_more.svg";
import ShareImg from "../assets/images/icon_share.svg";
import DownImg from "../assets/images/icon_down_arrow_outline.svg"
import ExportImg from "../assets/images/icon_export.svg";
import EditImg from "../assets/images/icon_edit.svg";
import UploadImg from "../assets/images/icon_upload.svg";
import DetailImg from "../assets/images/icon_detail.svg";
import LetteredAvatar from 'react-lettered-avatar';
import { CopyToClipboard } from "react-copy-to-clipboard";
import Edit from "./Edit";
import New from "./New";
import {useNavigate} from "react-router-dom";


const Box = styled.div`
    margin-bottom: 10px;
`

const CopiedBox = styled.div`
    position: absolute;
  right: 0;
  top: 21px;
`

export default function RhtBox(props){
    const {id,item} = props;
    const [show, setShow] = useState(false);
    const [showEdit,setShowEdit] = useState(false);
    const [showNew,setShowNew] = useState(false);
    const navigate = useNavigate();
    const [current,setCurrent] = useState();

    const arrayWithColors = [
        "#16a085",
        "#f1c40f",
        "#27ae60",
        "#e67e22",
        "#e74c3c",
        "#c0392b",
        '#3498db',
        '#8e44ad',
    ];

    useEffect(()=>{
        const toggleFolder = document.getElementById(id);
        const showFolderContentAnimation = anime.timeline({
            easing: "easeOutCubic",
            autoplay: false
        });
        showFolderContentAnimation
            .add({
                targets: `#js_folder-content_${id}`,
                height: [0, 190],
                duration: 350
            })
            .add(
                {
                    targets: `#js_folder-summary-amount_${id}`,
                    opacity: [1, 0],
                    duration: 400
                },
                "-=350"
            )
            .add(
                {
                    targets: `#js_folder-collapse-button_${id}`,
                    opacity: [0, 1],
                    duration: 400
                },
                "-=300"
            )
            .add(
                {
                    targets: `#js_folder-collapse-button-icon_${id}`,
                    duration: 300,
                    translateX: ["-50%", "-50%"],
                    translateY: ["-50%", "-50%"],
                    rotate: ["0deg", "180deg"]
                },
                "-=400"
            )
            .add(
                {
                    targets: `.js_folder-item_${id}`,
                    translateY: [20, 0],
                    opacity: [0, 1],
                    duration: 300,
                    delay: (el, i,l) => i * 120
                },
                "-=275"
            );

// --------- TRIGGER

        toggleFolder.addEventListener("click", () => {
            if (showFolderContentAnimation.began) {
                showFolderContentAnimation.reverse();
                if (
                    showFolderContentAnimation.progress === 100 &&
                    showFolderContentAnimation.direction === "reverse"
                ) {
                    showFolderContentAnimation.completed = false;
                }
            }

            if (showFolderContentAnimation.paused) {
                showFolderContentAnimation.play();
            }
        });

    },[])

    const handleCopy = () =>{
        setShow(true)
        setTimeout(()=>{
            setShow(false)
        },1000)
    }

    const handleEdit = () =>{
        setShowEdit(true)
    }

    const handleCloseEdit = () =>{
        setShowEdit(false)
    }
    const handleNew = (item) =>{
        setShowNew(true)
        console.log(item)
        setCurrent(item)
    }

    const handleCloseNew = () =>{
        setShowNew(false)
    }

    const toList = (id) =>{
        navigate(`/list/${id}`)
    }

    return <Box>
        {
            showEdit && <Edit handleClose={handleCloseEdit}/>
        }
        {
            showNew && <New handleClose={handleCloseNew} item={current}/>
        }
        <div className="cardBox">
            <div className="folder" id={`js_folder_${id}`}>
                <div className="folder-summary" id={id}>
                    <div className="folder-summary__start">
                        <button className="folder-collapse-button" id={`js_folder-collapse-button_${id}`}>
                            <img src={DownImg} alt=""/>
                        </button>
                        <div className="folder-summary__file-count" id={`js_folder-summary-amount_${id}`}>
                            <LetteredAvatar
                                backgroundColors={arrayWithColors}
                                name={item.name}
                                size={24}
                                color="#000"
                                radius={24}
                            />
                        </div>
                    </div>

                    <div className="folder-summary__details">
                        <div className="folder-summary__details__name w100" >
                            {item.name}
                        </div>
                    </div>
                    <div className="folder-summary__end">
                        <img src={MoreImg} alt=""/>
                    </div>
                </div>

                <ul className="folder-content" id={`js_folder-content_${id}`}>

                    <li className={`folder-item js_folder-item_${id} js_folder-item`}>
                        <div className="folder-item__icon">
                            <img src={DetailImg} alt=""/>
                        </div>
                        <div className="folder-item__details">
                            <div className="folder-item__details__name" onClick={()=>toList(item.id)}>
                                Detail
                            </div>
                        </div>
                    </li>
                    <li className={`folder-item js_folder-item_${id} js_folder-item`}>
                        <div className="folder-item__icon">
                                <img src={ShareImg} alt=""/>
                        </div>
                        <div className="folder-item__details">
                            <CopyToClipboard text={item.metaFileId} onCopy={handleCopy}>
                                <div className="folder-item__details__name">Share</div>
                            </CopyToClipboard>
                            {
                                show && <CopiedBox>Copied!</CopiedBox>
                            }

                        </div>
                    </li>

                    <li className={`folder-item js_folder-item_${id} js_folder-item`}>
                        <div className="folder-item__icon">
                            <img src={ExportImg} alt=""/>
                        </div>
                        <div className="folder-item__details">
                            <div className="folder-item__details__name">
                               Export
                            </div>
                        </div>
                    </li>
                    <li className={`folder-item js_folder-item_${id} js_folder-item`}>
                        <div className="folder-item__icon">
                            <img src={EditImg} alt=""/>
                        </div>
                        <div className="folder-item__details">
                            <div className="folder-item__details__name" onClick={()=>handleEdit()}>
                               Edit
                            </div>
                        </div>
                    </li>
                    <li className={`folder-item js_folder-item_${id} js_folder-item`}>
                        <div className="folder-item__icon">
                            <img src={UploadImg} alt=""/>
                        </div>
                        <div className="folder-item__details">
                            <div className="folder-item__details__name" onClick={()=>handleNew(item)}>
                               New Media
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </Box>
}