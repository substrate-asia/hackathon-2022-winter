import { FC } from "react";
import BaseButton from "../ui/base-button";

interface Prop {
  handClaim: () => void
}

const Claim: FC<Prop> = ({ handClaim }) => {
  return (
    <div
      className="w-full pl-4 pr-4 flex flex-col items-center"
    >
      <img
        src="../../assets/icon3.png"
        alt=""
        className="w-16 h-16 mb-4"
        style={{
          marginTop: '180px'
        }}
      />
      <div className="text-white text-sm"
        style={{
          marginBottom: '160px'
        }}
      >Thank you for installing and using our plugin, you will be rewarded.</div>
      <div className="mb-10 w-full">
        <BaseButton
          label="Claim 20 ADM"
          handleClick={handClaim}
        />
      </div>
    </div>
  )
}

export default Claim;