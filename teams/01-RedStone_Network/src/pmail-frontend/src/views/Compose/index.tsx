/* eslint-disable tailwindcss/migration-from-tailwind-2 */
/* eslint-disable tailwindcss/classnames-order */
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './Editor/Editor.css'
import { uploadMail } from '@/api/index'
import { nanoid } from 'nanoid'
import { sendMailBlock } from '@/api/substrate'
import { useAppSelector } from '@/hooks'
import { editorModules } from './Editor/editor'
import { toast, Id } from 'react-toastify'
import { RxFileText, RxTrash } from 'react-icons/rx'
import { getAddressType } from '@/utils/index'

function Home(): JSX.Element {
  const user = useAppSelector((state) => state.user)
  const toastId = useRef<Id | null>(null)
  const [mailInfo, setMailInfo] = useState('')
  const [toValue, setToValue] = useState('')
  const [subjectValue, setSubjectValue] = useState('')
  const [tipText, setTipText] = useState('')
  const [sending, setSending] = useState(false)
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
      const { code, data } = await uploadMail<string>(uuid, body)

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
      <div className="flex flex-col w-full h-full rounded-lg shadow">
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 mb-3 bg-white rounded-lg shadow">
            <div className="flex items-center py-1 border-b">
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
                }}
                className="block w-full truncate rounded border border-none bg-white p-2.5 text-sm text-gray-900 focus:border-none focus:ring-white"
              />
            </div>
            <div className="text-xs text-red-600 h-14 ">{tipText}</div>
            <div className="flex items-center py-1 border-b">
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
          <div className="px-4 py-2 overflow-scroll bg-white rounded-lg shadow grow">
            <div className="pb-4 h-5/6 grow">
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
              className="px-5 py-2 mr-3 text-white transition rounded bg-btnBlue hover:bg-btnHoverBlue"
            >
              Send
            </button>
            <button
              onClick={submit}
              className="flex items-center px-5 py-2 mr-3 transition rounded text-textBlack bg-btnGary hover:bg-btnHoverGary"
            >
              <RxFileText className="text-lg" />
              Save draft
            </button>
            <button
              onClick={submit}
              className="flex items-center px-5 py-2 transition rounded text-textBlack bg-btnGary hover:bg-btnHoverGary"
            >
              <RxTrash className="text-lg" />
              Discard
            </button>
          </div>
        </div>
      </div>
      {sending && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 h-modal opacity-20 md:inset-0 md:h-full"></div>
      )}
    </>
  )
}

export default Home
