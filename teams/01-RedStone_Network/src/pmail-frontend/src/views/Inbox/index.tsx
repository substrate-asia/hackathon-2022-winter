/* eslint-disable tailwindcss/classnames-order */
import React from 'react'
import MailList from '@/components/MailList'
import { Button, Modal, Spinner, TextInput } from 'flowbite-react'
import { bindMail, getMail } from '@/api/substrate'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { setMail } from '@/store/user'
import { Types } from '@/components/MailList'

function Inbox() {
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [bindShow, setBindShow] = useState(false)
  const [bindLoading, setBindLoading] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [tipInfo, setTipInfo] = useState('')

  useEffect(() => {
    async function init() {
      if (!user.mail) {
        const mail = await getMail(user.address)
        if (!mail) {
          setBindShow(true)
        } else {
          dispatch(setMail(mail as string))
        }
      }
    }
    init()
  }, [])
  const doBind = async () => {
    if (!name) {
      setTipInfo('place input a name')
      setShowTip(true)
      return
    }
    setBindLoading(true)
    try {
      await bindMail(`${name}`)
      dispatch(setMail(`${name}`))
      setBindShow(false)
      setBindLoading(false)
    } catch (e) {
      const errString = e.toString()
      if (errString === 'Error: Cancelled') {
        setTipInfo('Cancelled')
        setShowTip(true)
        return
      }
      if (errString.includes('account balance too low')) {
        setTipInfo('account balance too low')
        setShowTip(true)
      }
      setBindLoading(false)
    }
  }
  return (
    <div className="h-full py-4 bg-white rounded-lg shadow">
      <MailList type={Types.INBOX} />
      <Modal show={bindShow} size="md">
        <h3 className="pt-4 text-xl font-medium text-center text-gray-900 transition dark:text-white">
          Bind Mail Address
        </h3>
        <Modal.Body>
          <div className="px-6 pb-4 space-y-6 sm:pb-6 lg:px-8 xl:pb-8">
            <div>
              <div className="flex items-center">
                <TextInput
                  className="mr-2"
                  id="email"
                  placeholder="add name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    e.target.value === '' && setTipInfo('place input a name')
                    setShowTip(e.target.value === '')
                  }}
                  required={true}
                />
                @pmailbox.org
              </div>
              <div className="h-4 mt-2 text-sm text-red-600">
                {showTip ? tipInfo : ' '}
              </div>
            </div>
            <div className="flex justify-center w-full">
              <Button
                onClick={doBind}
                disabled={bindLoading}
                size="lg"
                gradientDuoTone="purpleToBlue"
              >
                {bindLoading ? (
                  <>
                    <div className="mr-3">
                      <Spinner size="sm" />
                    </div>
                    Loading ...
                  </>
                ) : (
                  'bind'
                )}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Inbox
