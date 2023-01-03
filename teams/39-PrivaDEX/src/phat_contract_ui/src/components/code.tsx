import type { FC, ReactNode } from 'react'

import tw from 'twin.macro'


const Code: FC<{ children: ReactNode }> = ({ children }) => (
  <code tw="font-mono text-xs p-1 bg-black rounded">
    {children}
  </code>
)


export default Code