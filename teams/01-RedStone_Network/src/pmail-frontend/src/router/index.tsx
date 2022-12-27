import { Route, Routes, Navigate } from 'react-router-dom'
import Layout from '@/Layout/index'
import NotFund from '@/Layout/NotFound'

import Home from '@/views/Home'
import Inbox from '@/views/Inbox'
import Compose from '@/views/Compose'
import Sent from '@/views/Sent'
import Login from '@/views/Login'
import ShowMail from '@/views/ShowMail'
import Contracts from '@/views/Contracts'
import Cloud from '@/views/Cloud'
import Empty from '@/components/Empty'

export default function Router() {
  return (
    <Routes>
      <Route path="home" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/inbox" />} />
        <Route path="inbox">
          <Route index element={<Inbox />}></Route>
          <Route path=":hash" element={<ShowMail />}></Route>
        </Route>
        <Route path="compose" element={<Compose />} />
        <Route path="sent">
          <Route index element={<Sent />}></Route>
          <Route path=":hash" element={<ShowMail />}></Route>
        </Route>
        <Route path="drafts" element={<Empty />} />
        <Route path="spam" element={<Empty />} />
        <Route path="trash" element={<Empty />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="cloud" element={<Cloud />} />
      </Route>
      <Route path="*" element={<NotFund />} />
    </Routes>
  )
}
