import { FC } from 'react'

interface Props {
  label: string
  bg: string
}

const BaseTag: FC<Props> = ({ label, bg }) => {
  return (
    <div
      className='inline-flex px-2 py-1 rounded'
      style={{
        background: bg
      }}
    >
      <div className='text-white text-xs font-semibold'>{label}</div>
    </div>
  )
}

export default BaseTag;