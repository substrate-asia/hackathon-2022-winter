/* eslint-disable tailwindcss/classnames-order */
import addIcon from '@/assets/add.png'
import accountIcon from '@/assets/account.png'
import { Button, Label, Modal, Spinner, TextInput } from 'flowbite-react'
import { doSetAlias } from '@/api/substrate'
import { getAddressType } from '@/utils/index'
import { toast } from 'react-toastify'
import { getAliasList } from '@/api/list'
import { useAppSelector } from '@/hooks'
import Empty from '@/components/Empty'

function Contracts(): JSX.Element {
  const user = useAppSelector((state) => state.user)
  const [addDlgOpen, setAddDlgOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameTip, setNameTip] = useState('')
  const [alias, setAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [aliasTip, setAliasTip] = useState('')
  const [concatList, setConcatList] = useState<
    { name: string; address: string }[]
  >([])
  const fetchAliasList = async () => {
    const { data } = await getAliasList(user.address)
    const list = data?.contacts?.nodes ?? []
    const conList = list.map((item) => ({
      name: item.alias,
      address: item.addr.mailaddress
    }))
    setConcatList(conList)
  }
  useEffect(() => {
    fetchAliasList()
  }, [])
  const submit = async () => {
    if (!name) {
      setNameTip('Please input your name')
      return
    }
    if (getAddressType(name) === null) {
      setNameTip('Invalid name found, please check your name')
      return
    }
    if (!alias) {
      setAliasTip('Please input your alias')
      return
    }
    const accountObj = {} as any
    const type = getAddressType(name)!
    accountObj[type] = name
    setLoading(true)
    try {
      await doSetAlias(accountObj, alias)
      setAddDlgOpen(false)
      setNameTip('')
      setAliasTip('')
      toast.success('bind name successful', {
        autoClose: 2000,
        isLoading: false,
        pauseOnFocusLoss: false,
        hideProgressBar: true,
        closeButton: false
      })
      setLoading(false)
      fetchAliasList()
    } catch (e) {
      setNameTip('')
      setAliasTip('')
      setLoading(false)
      toast.error('bind name fail', {
        autoClose: 2000,
        isLoading: false,
        pauseOnFocusLoss: false,
        hideProgressBar: true,
        closeButton: false
      })
    }
  }
  return (
    <>
      <div className="h-full py-4 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button
            onClick={() => {
              setName('')
              setAlias('')
              setNameTip('')
              setAliasTip('')
              setLoading(false)
              setAddDlgOpen(true)
            }}
            className="flex items-center justify-center w-16 h-16 transition rounded-full bg-btnBlue hover:bg-btnHoverBlue"
          >
            <img className="h-9 w-9" src={addIcon} alt="" />
          </button>
        </div>
        <div className="h-full">
          {concatList.length === 0 && <Empty></Empty>}
          <div className="pl-14">
            {concatList.map((item) => (
              <div
                key={item.address}
                className="flex items-center py-2 text-sm border-b cursor-pointer hover:bg-background"
              >
                <div className="mr-14">
                  <img className="h-30 w-30" src={accountIcon} alt="" />
                </div>
                <div>
                  <div className="pb-1 font-bold">{item.name}</div>
                  <div>{item.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal show={addDlgOpen} onClose={() => setAddDlgOpen(false)}>
        <Modal.Header>Add Contract</Modal.Header>
        <Modal.Body>
          <div className="block mb-2 text-base">
            <Label htmlFor="countries" value="your country" />
          </div>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="input polkadot address or Eht address or web2 address"
          />
          <div className="px-2 text-xs text-red-500 h-14">{nameTip}</div>
          <div>
            <div className="block mb-2">
              <Label value="Your Alias" />
            </div>
            <TextInput
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="alias"
            />
            <div className="px-2 text-xs text-red-500 h-14">{aliasTip}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            gradientMonochrome="info"
            onClick={submit}
            color="gray"
          >
            {loading ? (
              <>
                <div className="mr-3">
                  <Spinner size="sm" />
                </div>
                Loading ...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Contracts
