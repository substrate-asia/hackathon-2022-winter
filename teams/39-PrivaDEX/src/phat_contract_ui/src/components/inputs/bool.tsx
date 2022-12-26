import type { FC, ReactNode } from 'react'
import type { UseRadioProps } from '@chakra-ui/react'

import React, { useState } from 'react'
import tw from 'twin.macro'
import { Box, Radio, RadioGroup, Stack, HStack, useRadio, useRadioGroup } from '@chakra-ui/react'


const RadioCard: FC<{ children: ReactNode } & UseRadioProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='sm'
        borderColor="gray.300"
        _checked={{
          bg: 'phalaDark.600',
          color: 'white',
          borderColor: 'phalaDark.700',
        }}
        _focus={{
          borderColor: 'phalaDark.800',
        }}
        bg='gray.200'
        color='gray.600'
        px={4}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export const BoolInput: FC<{
  value?: boolean | undefined;
  onChange?: (value: boolean) => unknown
}> = ({ value, onChange }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    value: value === undefined ? 'undefined' : value ? 'true' : 'false',
    onChange: val => onChange && onChange(val === 'true'),
  })
  return (
    <HStack {...getRootProps()}>
      <RadioCard {...getRadioProps({ value: 'true' })}>true</RadioCard>
      <RadioCard {...getRadioProps({ value: 'false' })}>false</RadioCard>
    </HStack>
  )
}