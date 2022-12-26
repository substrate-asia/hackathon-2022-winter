import React from 'react'
import EmptyIcon from '@/assets/empty.png'

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-4 bg-white rounded-lg shadow">
      <img className="w-20 h-20 mb-4" src={EmptyIcon} />
      <div className="text-grayText">It’s empty</div>
    </div>
  )
}

export default Empty
