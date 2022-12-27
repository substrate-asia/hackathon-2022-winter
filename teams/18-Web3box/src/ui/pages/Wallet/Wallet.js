import React from "react";
import './Wallet.scss';
import { connect ,useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setAccount,setSeed } from '../../store/action';
import creat_img from '../../images/creat.png';
import import_img from '../../images/impot.png';
import spile_img from '../../images/spile.png';
import SuperChain from '../SuperChain/SuperChain';
function Wallets(props) {
    console.log(props)
    const {setAccount,setSeed,dispatch} =props
    // const test=()=>{
    //     dispatch(setAccount(2))
    // }
    // const test1=()=>{
    //     dispatch(setSeed('ice'))
    // }
    const Navigate = useNavigate();
    const CreatWalletRouter = (props) => {
      console.log(props)
      Navigate('/CreatWallet')
    };
    const LoginWalletRouter = (props) => {
        console.log(props)
        Navigate('/LoginWallet')
      };
    return (
        <div className="wallet" >
           {/* <span style={{color:'#fff'}} onClick={()=>test()}>wallet</span> 
            <p  style={{color:'#fff'}}  onClick={()=>test1()} >11111</p> */}

            <div className='login_wallet'>
                <h6>Risk Protocol Wallet</h6>
                <ul>
                    <li onClick={CreatWalletRouter}>
                       <p>
                            <img className="solid_white" src={creat_img}></img> 
                            <span>Create Your Wallet</span>
                       </p>
                       <img className="spile proy" src={spile_img}></img> 
                    </li>
                    <li onClick={LoginWalletRouter}>
                       <p>
                            <img className="solid_white" src={import_img}></img> 
                            <span>Login Your Wallet</span>
                       </p>
                       <img className="spile proy" src={spile_img} ></img> 
                    </li>

                </ul>
            </div>
            <SuperChain></SuperChain>
            </div>
      
    )
}
const mapDispatchToProps= () =>{ 
    return {
        setAccount, setSeed 
    }
}
export default connect(mapDispatchToProps)(Wallets)
