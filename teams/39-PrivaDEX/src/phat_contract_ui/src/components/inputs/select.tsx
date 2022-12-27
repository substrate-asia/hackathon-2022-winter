import { FC, ReactNode, useEffect } from 'react'

import React, { useState } from 'react'
import tw from 'twin.macro'
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
} from "@chakra-ui/react"
import { HiChevronDown as ChevronDownIcon, HiOutlineCheck as CheckIcon } from 'react-icons/hi'


interface SelectOption {
  label: string;
  value: string;
}

type SelectProps<T> = {
  value: string | undefined;
  onChange: (value: string) => unknown;
  placeholder?: ReactNode;
  options: T & SelectOption[];
}


export function Select<T>({
  value,
  onChange,
  placeholder,
  options,
}: SelectProps<T>) {
  const selected = value || options[0].value
  const preview = selected ? options.filter(i => i.value === selected)?.[0]?.label : placeholder
  return (
    <Menu>
      <MenuButton
        w="100%"
        as={Button}
        _focus={{
          borderColor: "phalaDark.600", 
        }}
        _active={{
          borderColor: "phalaDark.600", 
        }}
        rightIcon={<ChevronDownIcon tw="text-gray-300" />}
      >
        {preview}
      </MenuButton>
      <MenuList tw="rounded-sm bg-black box-shadow[none]">
        {options.map((option, idx) => (
          <MenuItemOption
            key={idx}
            onClick={() => onChange(option.value)}
            tw="text-gray-200"
            icon={<CheckIcon tw="text-phala-500" />}
            isChecked={option.value === selected}
          >
            {option.label}
          </MenuItemOption>
        ))}
      </MenuList>
    </Menu>
  )
}