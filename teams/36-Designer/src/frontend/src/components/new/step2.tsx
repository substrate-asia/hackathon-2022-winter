import styled from "styled-components";
import BgImg from "../../assets/images/bg.png";
import CloseImg from "../../assets/images/icon_close.svg";
import MeImg from "../../assets/images/icon_person.svg";
import GroupImg from "../../assets/images/icon_group.svg";
import {ChangeEvent, useEffect, useState} from "react";
import {useAccount} from "@gear-js/react-hooks";
import {encodeAddress,decodeAddress} from "@polkadot/keyring";
import {hexToU8a,isHex} from "@polkadot/util";

const Box = styled.div`
  padding-top: 40px;
`

const UlBox = styled.div`
    dl{
      background: #1c1d22;
      box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
      display: flex;
      align-items: center;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
      position: relative;
      &:first-child{
        .close{
          display: none;
        }
      }
    }
  dt{
    width: 80px;
    height: 80px;
    margin-right: 20px;
    background: url(${BgImg}) center no-repeat;
    background-size: 100% 100%;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 2px 0 5px rgb(0 0 0 / 20%);
    img{
      width: 33px;
    }
  }
  dd{
    color: #c0c2cd;
    .name{
      font-size: 18px;
      color: #ffffff;
    }
  }
  .close{
    position: absolute;
    right: -10px;
    top: -10px;
    width: 30px;
    height:30px;
    background: #000;
    border: 1px solid #fcca00;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    img{
      width: 15px;
    }
  }
`
const Wallet = styled.div`
    display: flex;
  justify-content: center;
  align-items: center;
  background: #fcca00;
  color: #000000;
  padding: 0 20px;
  border-radius: 4px;
  font-family: "Lato-Regular";
  width: 200px;
  margin-top: 40px;
  height: 50px;
  cursor: pointer;
  &:hover{
    opacity: 0.8;
  }
`

const NextBtn = styled.button`
    display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  color: #fcca00;
  padding: 0 20px;
  border-radius: 4px;
  border: 2px solid #fcca00;
  font-family: "Lato-Regular";
  width: 150px;
  margin-top: 40px;
  height: 50px;
  cursor: pointer;
  margin-left: 20px;
  &:hover{
    opacity: 0.8;
  }
  &:disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const InputBox = styled.div`
  position: relative;
    input{
      background: #000;
      border: 0;
      height: 40px;
      margin-top: 10px;
      border-radius: 4px;
      width: 450px;
      color: #ffffff;
      padding: 0 20px;
      &:focus{
        outline: none;
        box-shadow: none;
      }
    }
  .error{
    color: red;
    position: absolute;
    bottom:-20px;
  }
`

const LastLine = styled.div`
    display: flex;
  align-items: center;
`
interface Iprops{
    checkStep:Function
    handleList:Function
}
interface obj{
    name:string
    address:string
    decodedAddress:string
}


export default function Step2(props:Iprops){

    const { checkStep,handleList } = props;
    const [ list,setList] = useState<obj[]>([]);
    const [disabled,setDisabled] = useState(false);
    const { account } = useAccount();

    useEffect(()=>{
        if(!account) return;
        let obj ={
            name:"Me",
            address:account.address,
            decodedAddress:account.decodedAddress
        }
        let arr:obj[] = [];
        arr.push(obj);
        setList(arr);

    },[])

    // useEffect(()=>{
    //     let arr=new Array(list.length).fill(false);
    //
    //     list.map((item,index)=>{
    //         arr[index] = isValidAddressPolkadotAddress(item.address);
    //     });
    //
    //     const disabledArr = arr.filter(item=>!item);
    //     setDisabled(!!disabledArr.length)
    //
    // },[list])

    const handleNext = () =>{
        checkStep(3)
        handleList(list)
    }
    const addNew = () =>{
        let obj ={
            name:"Adding a Participants Address",
            address:'',
            decodedAddress:''
        }
        let arr:obj[] = [...list];
        arr.push(obj);
        setList(arr);
    }

    const handleInput = (e:ChangeEvent,num:number) =>{
        let arr:obj[] = [...list];
        const {value} = e.target as HTMLInputElement;
        // arr[num].address = value;
        arr[num].decodedAddress = value;
        setList(arr);
    }
    const removeItem = (num:number)=>{
        let arr:obj[] = [...list];
        arr.splice(num,1);
        console.log(arr)
        setList(arr)
    }

    const isValidAddressPolkadotAddress = (address:string) => {
        try {
            encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
            return true;
        } catch (error) {
            return false;
        }
    };

    return <Box>
        <UlBox>
            {
                list.map((item,index)=>(<dl key={index}>
                    <div className="close" onClick={()=>removeItem(index)}>
                        <img src={CloseImg} alt=""/>
                    </div>
                    <dt>
                        <img src={!index?MeImg:GroupImg} alt=""/>
                    </dt>
                    <dd>
                        <div className="name">{item.name}</div>
                        {
                            !index &&<div>{item.decodedAddress}</div>
                        }
                        {
                            !!index && <InputBox>
                                <input type="text" placeholder="please fill the Address to sign" value={list[index].decodedAddress} onChange={(e)=>handleInput(e,index)}/>
                            </InputBox>
                        }

                    </dd>
                </dl>))
            }
        </UlBox>
        <LastLine>
            <Wallet onClick={()=>addNew()}>Add a signer</Wallet>
            {/*<NextBtn onClick={()=>handleNext()} disabled={disabled || list.length<=1}>Next</NextBtn>*/}
            <NextBtn onClick={()=>handleNext()} disabled={disabled}>Next</NextBtn>
        </LastLine>
    </Box>
}