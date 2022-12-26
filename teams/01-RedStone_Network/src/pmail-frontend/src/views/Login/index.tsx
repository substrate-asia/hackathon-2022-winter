/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable prettier/prettier */
/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { setName, setAddress } from '@/store/user'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import logo from '@assets/PMaiLogo.png'
import PM from '@assets/PM.png'
import LinkIcon from '@assets/icons/link.png'
import Safe from '@assets/icons/safe.png'
import Bit from '@assets/icons/bit.png'
import media from '@assets/media.png'
import discord from '@assets/discord.png'
import telegram from '@assets/telegram.png'
import twitter from '@assets/twitter.png'
import { GiCheckMark } from 'react-icons/gi'
import accountImg from '@assets/account.png'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { Button, ListGroup, Modal } from 'flowbite-react'

function Login() {
  const appName = import.meta.env.VITE_APP_NAME
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.user)

  const [selectedInfo, setSelectedInfo] = useState<{
    name: string
    address: string
  }>({
    name: '',
    address: ''
  })
  useEffect(() => {
    if (user) {
      setSelectedInfo({
        name: user.name,
        address: user.address
      })
    }
  }, [user])

  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [accountModalShow, setAccountModalShow] = useState(false)
  const closeModal = () => setAccountModalShow(false)

  const chooseAccount = (account: InjectedAccountWithMeta) => {
    setSelectedInfo({
      name: account.meta.name ?? '',
      address: account.address
    })
  }
  const confirm = () => {
    dispatch(setAddress(selectedInfo.address))
    dispatch(setName(selectedInfo.name))
    setAccountModalShow(false)
    navigate('/inbox')
  }
  const getAccounts = async (): Promise<undefined> => {
    const extensions = await web3Enable(appName)

    if (extensions.length === 0) {
      return
    }
    const accounts = await web3Accounts()
    if (accounts.length === 0) {
      return
    }
    setAccounts(accounts)
    setSelectedInfo({
      name: user.name,
      address: user.address
    })
    setAccountModalShow(true)
    return
  }
  return (
    <>
      <div className="relative flex items-center justify-center w-full h-full bg-white bg-center bg-no-repeat bg-contain bg-login-bg ">
        <div className="absolute top-0 left-0 flex justify-between w-full">
          <div className="pt-4 pl-4">
            <img className="w-196" src={PM} alt="" />
          </div>
          <div className="pt-4 pr-5">
            <button className="btn-login" onClick={getAccounts}>Connect Wallet</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between h-full mx-auto w-951">
          <div>
            <div className="pt-178">
              <img className="h-20 mx-auto" src={logo} alt="" />
            </div>
            <div className="font-sans pt-30 text-textBlack">
              <div className="text-center text-50">The Next Generation Email</div>
              <div className="pt-2 text-lg text-center">Meet web3 Email - It’s safer, cleaner, and simply better!</div>
              <button className="btn-login mt-9" >Sign up for free</button>
              <div className="flex justify-center pt-20">
                <div className="mr-16 text-center transition rounded-md cursor-pointer bg-bgBlue w-188 h-188 hover:shadow-md">
                  <img className="inline-block w-10 h-10 mt-3.5 mb-5" src={LinkIcon} alt="" />
                  <div className="pb-2 font-sans text-base font-bold leading-none ">Email aggregation</div>
                  <div className="pl-5 font-sans text-base leading-5 text-left">Send/receive Emails between web2 Emails and web3 Emails of different protocols.</div>
                </div>
                <div className="mr-16 text-center transition rounded-md hover:shadow-md bg-bgBlue w-188 h-188">
                  <img className="inline-block w-10 h-10 mt-3.5 mb-5" src={Bit} alt="" />
                  <div className="pb-2 font-sans text-base font-bold leading-none ">Asset transaction</div>
                  <div className="pl-5 font-sans text-base leading-5 text-left ">Better way of airdrop, and private asset transactions.</div>
                </div>
                <div className="text-center transition rounded-md hover:shadow-md bg-bgBlue w-188 h-188">
                  <img className="inline-block w-7 h-10 mt-3.5 mb-5" src={Safe} alt="" />
                  <div className="pb-2 font-sans text-base font-bold leading-none ">Email encryption</div>
                  <div className="pl-5 font-sans text-base leading-5 text-left ">Public, private and decentralized Emails.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex pb-5">
            <img className="w-10 h-10 mr-6" src={twitter} alt="" />
            <img className="w-10 h-10 mr-6" src={discord} alt="" />
            <img className="w-10 h-10 mr-6" src={media} alt="" />
            <img className="w-10 h-10" src={telegram} alt="" />
          </div>
        </div>
      </div>
      <Modal show={accountModalShow} onClose={closeModal}>
        <Modal.Header>Choose Account</Modal.Header>
        <Modal.Body>
          <ListGroup>
            {accounts.map((account) => (
              <ListGroup.Item
                active={selectedInfo.address === account.address}
                className="mb-2"
                onClick={() => chooseAccount(account)}
                key={account.address}
              >
                <div className="flex items-center justify-between w-full py-2">
                  <div className="flex items-center">
                    <div>
                      <img className="w-6 h-6 mr-2" src={accountImg} alt="" />
                    </div>
                    <div className="text-left">
                      <div>{account.meta.name}</div>
                      <div>{account.address}</div>
                    </div>
                  </div>
                  <div>
                    {selectedInfo.address === account.address ? (
                      <GiCheckMark />
                    ) : null}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="justify-center">
          <Button onClick={confirm} gradientDuoTone="purpleToBlue">
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Login
