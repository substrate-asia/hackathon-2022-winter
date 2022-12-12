import React, { useContext } from "react";
import './CreatWalletFile.scss';
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed } from '../../store/action';
// import SuperChain from '../SuperChain/SuperChain'
import Top from '../../images/router.png';
import Warring from '../../images/warring.png';
import { Button, message } from 'antd';
import files from '../../images/file.png';
import down from '../../images/dowload.png';
import { CreatWalletContext } from '../CreatWallte/CreatWallte'
import { postWallet } from '../../../substrate/walletManager';
import { useNavigate } from 'react-router-dom';

const CreatWalletFile = (props) => {
    const {account} =props;
    const { seed,password,list } = useContext(CreatWalletContext)
    const seedCODE = seed.split(/\s+/);
    const Navigate = useNavigate();
    const walletHome=()=>{
        Navigate('/WalletHome')
    }
    const copySeed = () => {
        let copyContent = seed;
        var input = document.createElement("input");
        input.value = copyContent;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        document.body.removeChild(input);
        message.success('Successfully copied Address.');
    };
    //download keystore
    const Downloads = (address,newPass) => {
        console.log(address)
        console.log(newPass)
        const ps2 = {
            address,
            newPass
          }
          postWallet(1,'pol.accountsExport',ps2).then(res=>{
            funDownload(JSON.stringify(res), `keyFile.json`);

          });
      
    };
    const funDownload = (content, filename) => {
        var eleLink = document.createElement("a");
        eleLink.download = filename;
        eleLink.style.display = "none";
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };
    return (
        <div className="CreatWalletFile" >
            <div className='top_'>
                <h6>Secret Phrase</h6>
                <img onClick={copySeed} src={files}></img>
            </div>
            <div className='CreatWallet_c'>
                <div className='SecretPhrase'>
                    <ul>
                        {
                            seedCODE.map((item, index) => {
                                return <li key={index}><a>{index + 1}</a><span>{item}</span></li>
                            })
                        }
                    </ul>
                </div>
               
                <p><input placeholder='Download Keyfile' disabled></input> <img onClick={()=>{Downloads(account,password)}} src={down}></img></p>
                <h6><img src={Warring}></img>Note: Never disclose this Secret Phrase.</h6>
                <div className='Confirm_c'>
                    <Button onClick={walletHome} className='Confirm'>Confirm</Button>
                </div>
            </div>
        </div>

    )
}
const mapDispatchToProps = () => {
    return {
        setAccount, setSeed
    }
}
const mapStateToProps=(state)=>{
    return {account:state.account}
  }
//Link building rudux
export default connect(mapStateToProps)(CreatWalletFile)
