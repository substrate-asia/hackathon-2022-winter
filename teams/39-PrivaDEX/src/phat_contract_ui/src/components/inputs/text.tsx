import type { FC } from 'react'

import React from 'react'
import tw from 'twin.macro'
import { Input } from '@chakra-ui/react'

export const TextInput: FC<{
  value?: string | undefined;
  onChange?: (value: string) => unknown
}> = ({ value, onChange }) => {
  return (
    <Input
      type='text'
      value={value}
      onChange={ev => onChange && onChange(ev.target.value || '')}
    />
  )
}