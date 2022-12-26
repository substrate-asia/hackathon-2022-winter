import { FC } from 'react'

interface Props {
  label: string
  handleClick: () => void
  disable?: boolean
}

const BaseBtn: FC<Props> = ({ label, disable = false, handleClick }) => {
  return (
    <div
      className='inline-flex px-6 py-2.5 rounded-full bg-blue-1000 hover:opacity-80 cursor-pointer'
      onClick={() => {
        if (!disable) {
          handleClick()
        }
      }}
    >
      <div className='text-white font-base font-bold'>{label}</div>
    </div>
  )
}

export default BaseBtn;