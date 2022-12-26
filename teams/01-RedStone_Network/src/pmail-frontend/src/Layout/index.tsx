import logo from '@/assets/logo.png'
import compose from '@/assets/icons/compose.png'
import inbox from '@/assets/icons/inbox.png'
import sent from '@/assets/icons/sent.png'
import contacts from '@/assets/icons/contacts.png'
import logOut from '@/assets/icons/logout.png'
import account from '@assets/account.png'
import drafts from '@/assets/icons/drafts.png'
import spam from '@/assets/icons/spam.png'
import trash from '@/assets/icons/trash.png'
import { Outlet, NavLink } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { setName, setAddress, setMail } from '@/store/user'

const Layout = (): JSX.Element => {
  const user = useAppSelector((state) => state.user)
  const Navigate = useNavigate()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!user.name) {
      Navigate('/login')
    }
  })
  const doLogout = () => {
    dispatch(setName(''))
    dispatch(setAddress(''))
    dispatch(setMail(''))
    Navigate('/login')
  }

  const menus = [
    {
      icon: compose,
      name: 'Compose',
      href: '/compose',
      value: 0
    },
    {
      icon: inbox,
      name: 'Inbox',
      href: '/inbox',
      value: 0
    },
    {
      icon: sent,
      name: 'Sent',
      href: '/sent',
      value: 0
    },
    {
      icon: drafts,
      name: 'Drafts',
      href: '/drafts',
      value: 0
    },
    {
      icon: spam,
      name: 'Spam',
      href: '/spam',
      value: 0
    },
    {
      icon: trash,
      name: 'Trash',
      href: '/trash',
      value: 0
    },
    {
      icon: contacts,
      name: 'Contracts',
      href: '/contracts',
      value: 0
    }
  ]
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background">
      <div className="flex-none h-screen overflow-hidden w-256 bg-SideBarBackground text-SideBarText">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="pt-12 pl-6">
              <img className="w-117" src={logo} alt="logo" />
            </div>
            <div className="pt-12">
              <div className="px-2">
                {menus.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => {
                      const normalClass =
                        'mb-2 flex h-8 w-236 cursor-pointer items-center  justify-between rounded-full transition-colors hover:bg-sideBarHoverBackground hover:text-white'
                      return isActive
                        ? normalClass +
                            ' bg-SideBarActiveBackground text-whiteText'
                        : normalClass
                    }}
                  >
                    <div className="flex items-center ">
                      <img className="w-5 h-5 mx-4" src={item.icon} alt="" />
                      <div>{item.name}</div>
                    </div>
                    {item.value ? (
                      <div className="mx-3">{item.value}</div>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6">
            <div className="flex items-center pt-4 mb-4 border-t border-borderGray">
              <div className="mr-3 rounded-full h-50 w-50">
                <img src={account} alt="" />
              </div>
              <div>
                <div className="mb-1 text-white truncate w-36">{user.mail}</div>
                <div className="truncate w-36">{user.address}</div>
              </div>
            </div>
            <div
              onClick={doLogout}
              className="flex items-center mb-10 cursor-pointer"
            >
              <div className="w-5 h-5 mr-5">
                <img src={logOut} alt="" />
              </div>
              <div className="text-textBlue">Log Out</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-5 py-8">
        <div className="w-full h-full overflow-hidden ">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
