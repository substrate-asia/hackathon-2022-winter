import Base from "../components/base"
import Banner from "../components/home/banner"
import Task from "../components/home/task"
import Popular from "../components/home/popular"
import BaseCtx from "../contexts"
import { useState } from "react"

export default function Home() {
  const [address, setAddress] = useState('')
  const [step, setStep] = useState(1)
  return (
    <BaseCtx.Provider value={{ address, setAddress, step, setStep }}>
      <Base>
        <Banner />
        <Task />
        <Popular />
      </Base>
    </BaseCtx.Provider>
  )
}
