import { FC } from "react";
import Account from "./account";
import NFT from "./nft";
import Rewards from "./rewards";

interface Prop {
  address: string
}

const Dashboard: FC<Prop> = ({ address }) => {

  return (
    <div className="w-full pl-4 pr-4">
      <Account address={address} />
      <NFT />
      <Rewards />
    </div>
  )
}

export default Dashboard;