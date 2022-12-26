import type { SelectorOption } from '../atoms'

import React from 'react'
import tw from 'twin.macro'
import { FormControl, FormLabel, FormHelperText, Select } from '@chakra-ui/react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import * as R from 'ramda'

import { candidateFileInfoAtom, contractSelectorOptionListAtom, contractSelectedInitSelectorAtom } from '../atoms'

const InitSelectorField = () => { 
  const finfo = useAtomValue(candidateFileInfoAtom)
  const selectors = useAtomValue(contractSelectorOptionListAtom)
  const setInitSelector = useUpdateAtom(contractSelectedInitSelectorAtom)
  if (!finfo.size || !selectors.length) {
    return <></>
  }
  const chooseSelectors = R.head(selectors.filter(i => i.selected))
  const defaultSelectors = R.pipe(
    R.filter((c: SelectorOption) => c.label === 'default' || c.label === 'new'),
    R.sortBy((c: SelectorOption) => c.argCounts),
    i => R.head<SelectorOption>(i),
  )(selectors)
  const selected = chooseSelectors || defaultSelectors
  if (!selected) {
    return <></>
  }
  return (
    <FormControl>
      <FormLabel tw="bg-[#000] text-phala-500 p-4 w-full">Init Selector</FormLabel>
      <div tw="px-4 mt-4">
        <Select
          variant='outline'
          size="sm"
          tw="border border-solid border-black"
          defaultValue={selected.value}
          onChange={evt => {
            setInitSelector(evt.target.value)
          }}
        >
          {selectors.map((item, idx) => (
            <option value={item.value} key={idx}>
              {item.value} | {item.label}
            </option>
            ))}
        </Select>
        <FormHelperText tw="text-gray-500">
          You don't need change it if you don't know what it means.
        </FormHelperText>
      </div>
    </FormControl>
  )
}

export default InitSelectorField