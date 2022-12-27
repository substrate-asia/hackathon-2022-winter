/* eslint-disable tailwindcss/migration-from-tailwind-2 */
/* eslint-disable tailwindcss/classnames-order */
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './Editor/Editor.css'
import { uploadFile } from '@/api/index'
import { nanoid } from 'nanoid'
import { sendMailBlock } from '@/api/substrate'
import { useAppSelector } from '@/hooks'
import { editorModules } from './Editor/editor'
import { toast, Id } from 'react-toastify'
import { RxFileText, RxTrash } from 'react-icons/rx'
import { getAddressType, getMailType, TYPES_SHOW_NAME } from '@/utils/index'


function Home(): JSX.Element {
  const user = useAppSelector((state) => state.user)
  const toastId = useRef<Id | null>(null)
  const [mailInfo, setMailInfo] = useState('')
  const [toValue, setToValue] = useState('')
  const [subjectValue, setSubjectValue] = useState('')
  const [tipText, setTipText] = useState('')
  const [sending, setSending] = useState(false)
  const [accountType, setAccountType] = useState('')
  const NoError = 'No recipients defined'
  const checkError = 'Invalid recipient found, please check your recipients'

  const submit = async () => {
    if (toValue === '') {
      setTipText(NoError)
      toast.error(NoError, {
        autoClose: 2000,
        isLoading: false,
        pauseOnFocusLoss: false,
        hideProgressBar: true,
        closeButton: false
      })
      return
    }
    if (getAddressType(toValue) === null) {
      setTipText(checkError)
      toast.error(checkError, {
        autoClose: 2000,
        isLoading: false,
        pauseOnFocusLoss: false,
        hideProgressBar: true,
        closeButton: false
      })
      return
    }
    setTipText('')
    setSending(true)
    toastId.current = toast.loading('Please wait....', {
      pauseOnFocusLoss: false
    })
    const uuid = nanoid()
    const now = new Date()
    const body = {
      subject: subjectValue,
      body: mailInfo,
      from: [
        {
          Name: user.mail,
          Address: user.address
        }
      ],
      to: [
        {
          Name: '',
          Address: toValue
        }
      ],
      date: now.toDateString(),
      timestampe: now.getTime()
    }
    try {
      const { code, data } = await uploadFile<string>(uuid, body)

      if (code === 0 && data) {
        const timestamp = new Date().getTime()
        const storeHash = data
        const type = getAddressType(toValue)!
        await sendMailBlock(
          {
            [type]: toValue
          },
          timestamp,
          storeHash
        )
      }
      setSending(false)
      toast.update(toastId.current, {
        render: 'send mail successful',
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
        isLoading: false,
        pauseOnFocusLoss: false,
        hideProgressBar: true,
        closeButton: false
      })
    } catch (e) {
      toast.update(toastId.current, {
        render: 'send mail fail',
        type: toast.TYPE.ERROR,
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
      <div className="flex h-full w-full flex-col rounded-lg shadow">
        <div className="flex h-full flex-col">
          <div className="mb-3 rounded-lg bg-white px-4 py-2 shadow">
            <div className="flex items-center border-b py-1">
              <label
                htmlFor="to"
                className="block text-base font-bold text-black"
              >
                To:
              </label>
              <input
                type="text"
                id="to"
                placeholder="Recipient"
                autoComplete="off"
                required
                value={toValue}
                onChange={(e) => {
                  setToValue(e.target.value)
                  const type = getAddressType(e.target.value)
                  const mailType = getMailType(e.target.value)
                  if (mailType) {
                    setAccountType(mailType)
                    return
                  }
                  if (type) {
                    setAccountType(TYPES_SHOW_NAME[type])
                  } else {
                    setAccountType('')
                  }
                }}
                className="block w-full truncate rounded border border-none bg-white p-2.5 text-sm text-gray-900 focus:border-none focus:ring-white"
              />
              {accountType && <div className="flex transition h-fit items-center font-sans bg-btnBlue text-white rounded px-2 py-0.5 p-1.5 text-base">
                {accountType}
              </div>}
            </div>
            <div className="h-14 text-xs text-red-600 ">{tipText}</div>
            <div className="flex items-center border-b py-1">
              <label
                htmlFor="to"
                className="block text-base font-bold text-black"
              >
                Subject:
              </label>
              <input
                type="text"
                id="to"
                placeholder="Message Subject"
                autoComplete="off"
                value={subjectValue}
                onChange={(e) => {
                  setSubjectValue(e.target.value)
                }}
                required
                className="block w-full truncate rounded border border-none bg-white p-2.5 text-sm text-gray-900 focus:border-none focus:ring-white"
              />
            </div>
          </div>
          <div className="grow overflow-scroll rounded-lg bg-white px-4 py-2 shadow">
            <div className="h-5/6 grow pb-4">
              <ReactQuill
                theme="snow"
                className="h-full"
                modules={editorModules}
                value={mailInfo}
                onChange={setMailInfo}
              ></ReactQuill>
            </div>
          </div>
          <div className="flex pt-4 pl-4">
            <button
              onClick={submit}
              className="mr-3 rounded bg-btnBlue px-5 py-2 text-white transition hover:bg-btnHoverBlue"
            >
              Send
            </button>
            <button
              onClick={submit}
              className="mr-3 flex items-center rounded bg-btnGary px-5 py-2 text-textBlack transition hover:bg-btnHoverGary"
            >
              <RxFileText className="text-lg" />
              Save draft
            </button>
            <button
              onClick={submit}
              className="flex items-center rounded bg-btnGary px-5 py-2 text-textBlack transition hover:bg-btnHoverGary"
            >
              <RxTrash className="text-lg" />
              Discard
            </button>
          </div>
        </div>
      </div>
      {sending && (
        <div className="fixed inset-x-0 top-0 z-50 flex h-modal items-center justify-center overflow-y-auto bg-gray-900 opacity-20 overflow-x-hidden md:inset-0 md:h-full"></div>
      )}
    </>
  )
}

export default Home
