import { FC } from "react";
import Logo from "../svg/logo";

const Header: FC = () => {
  return (
    <div className="w-full h-12 pl-4 pr-4 flex items-center mb-4">
      <Logo />
    </div>
  )
}

export default Header;