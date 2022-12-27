/* eslint-disable tailwindcss/classnames-order */
import React from 'react'
import MailList from '@/components/MailList'
import { Types } from '@/components/MailList'

function Send() {
  return (
    <div className="h-full py-4 bg-white rounded-lg shadow">
      <MailList type={Types.SEND} />
    </div>
  )
}

export default Send
