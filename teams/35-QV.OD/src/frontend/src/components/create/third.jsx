import styled from "styled-components";
import {Button} from "react-bootstrap";
import {useSubstrate} from "../../api/contracts";
import '@polkadot/wasm-crypto/initOnlyAsm';
import { mnemonicGenerate,} from '@polkadot/util-crypto';
import { Keyring } from  '@polkadot/api';
import {useEffect, useState} from "react";

const Box = styled.div`
    padding: 20px;
  height: 520px;
  box-sizing: border-box;
  .main{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
`

const TitleBox = styled.div`
    padding: 20px 0 0;
  font-family: "Poppins-Medium";
  font-size: 24px;
  text-align: left;
`

const InputBox = styled.div`
    margin-top: 40px;
    background: #2e3134;
  width: 100%;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  span{
    display: inline-block;
    padding:0 20px 10px 0;
    color: #727475;
    font-family: "Poppins-Light";
  }
`

const Group = styled.div`
    button{
      width: 100%;
    }
`

export default function Third(){
    const {dispatch} = useSubstrate();
    const {state} = useSubstrate();
    const { name } = state;
    const [ mnemonicArr,setMnemonicArr] = useState([])
    const [ wallet,setWallet] = useState()

    const handleStep = () =>{
        dispatch({ type: 'SET_MNEMONIC', payload: mnemonicArr });
        dispatch({ type: 'SET_WALLET', payload: wallet });
        dispatch({ type: 'STEP', payload: 4 });
    }

    useEffect(()=>{
        createWallet()
    },[])

    const createWallet = async()=>{
        const keyring = new Keyring({type: 'sr25519'});
        const mnemonic = mnemonicGenerate();
        const wallet = await keyring.addFromUri(`${mnemonic}`, { name});
        console.log(wallet,mnemonic)
        const arr = mnemonic.split(" ");
        setWallet(wallet)
        setMnemonicArr(arr);
        const { address } = wallet;
        return {
            address,
            mnemonic,
        } ;
    }

    return <Box>
        <div className="main">
            <div>
                <TitleBox>Generated 12-word mnemonic seed</TitleBox>
                {
                    !!mnemonicArr.length &&<InputBox>
                        {
                            mnemonicArr.map((item,index)=>(<span key={index}>{item}</span>))
                        }
                    </InputBox>
                }

            </div>

            <Group>
                <Button variant="flat" onClick={()=>handleStep()} >Next</Button>
            </Group>
        </div>

    </Box>
}