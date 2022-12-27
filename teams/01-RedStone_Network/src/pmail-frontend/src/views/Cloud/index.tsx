/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable tailwindcss/classnames-order */
import React from 'react'
import Cupload from '@/assets/icons/upload.png'
import { Upload } from 'antd'
const { Dragger } = Upload
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { useAppSelector } from '@/hooks'
import { downloadFile } from '@/api/index'
import {transfer} from '@/api/substrate'
import { toast } from 'react-toastify'
import Empty from '@/components/Empty'
import './index.css'

function Cloud() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const user = useAppSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const toastId = useRef<Id | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  function getDefaultFileList() {
    if (user.address && window.localStorage.getItem(user.address)) {
      const fileListString = window.localStorage.getItem(user.address)
      return JSON.parse(fileListString as string)
    }
    return []
  }
  useEffect(() => {
    if (getDefaultFileList().length) {
      setIsEmpty(false)
      return
    }
    setIsEmpty(true)
  }, [fileList])

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: (file) => {
      return `/api/storage/${file.uid}`
    },
    beforeUpload: () => {
      toastId.current = toast.loading('Please wait....', {
        pauseOnFocusLoss: false
      })
      return transfer()
    },
    showUploadList: {
      showDownloadIcon: true,
      showPreviewIcon: false,
      showRemoveIcon: true,
    },
    onChange: async (info) => {
      const { status } = info.file;
      if (status === 'uploading') {
        setLoading(true)
      }
      if (status === 'done') {
        setLoading(false)
        toast.update(toastId.current, {
          render: `${info.file.name} file uploaded successfully.`,
          type: toast.TYPE.SUCCESS,
          autoClose: 2000,
          isLoading: false,
          pauseOnFocusLoss: false,
          hideProgressBar: true,
          closeButton: false
        })
        setFileList(info.fileList);
        window.localStorage.setItem(user.address, JSON.stringify(info.fileList))
      } else if (status === 'error') {
        setLoading(false)
        toast.update(toastId.current, {
          render: `${info.file.name} file upload failed.`,
          type: toast.TYPE.ERROR,
          autoClose: 2000,
          isLoading: false,
          pauseOnFocusLoss: false,
          hideProgressBar: true,
          closeButton: false
        })
      }
      window.localStorage.setItem(user.address, JSON.stringify(info.fileList))
      if (getDefaultFileList().length) {
        setIsEmpty(false)
        return
      }
      setIsEmpty(true)
    },
    defaultFileList: getDefaultFileList(),
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(1))}%`,
    },
    listType: 'picture-card',
    onPreview: () => {
      return false
    },
    onDownload: (file) => {
      downloadFile(file.response.data, file.name)
      return false
    },
    itemRender: (originNode) => {
      return (
        <div className="cursor-pointer">
          {originNode}
        </div>
      )}
    }

  return (
    <div className="h-full rounded-lg bg-white pt-8 flex flex-col shadow overflow-scroll">
      <div className="px-8">
        <Dragger {...props}>
          <p className="pt-7 pb-6 flex justify-center ">
            <img className="w-9 h-9" src={Cupload} alt="" />
          </p>
          <p className="text-base lining-5 text-textBlack leading-4	 font-bold	 font-sans">
            Click or drag file to this area to upload
          </p>
          <p className="text-base lining-5 pb-2 text-textBlack leading-4 font-sans">
            Support for a single or bulk upload
          </p>
        </Dragger>
      </div>
      {!loading && !fileList.length && !getDefaultFileList().length && (
        <div className="grow">
          {!loading && isEmpty &&<Empty></Empty>}
        </div>
      )}
    </div>
  )
}

export default Cloud
