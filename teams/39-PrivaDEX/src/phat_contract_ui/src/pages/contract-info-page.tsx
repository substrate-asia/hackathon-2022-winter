import React, { Suspense, useEffect } from 'react'
import tw from 'twin.macro'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
} from "@chakra-ui/react"
import { useAtom } from "jotai"
import { Link } from '@tanstack/react-location'
import { BiChevronRight } from 'react-icons/bi'
import { useMatch } from '@tanstack/react-location'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { currentContractIdAtom, currentContractAtom, pruntimeURLAtom } from '@/features/phat-contract/atoms'
import ContractInfo from '@/features/phat-contract/components/contract-info'
import ContractMethodGrid from '@/features/phat-contract/components/contract-method-grid'


const CurrentContractName = () => {
  const contract = useAtomValue(currentContractAtom)
  if (!contract) {
    return null
  }
  return (
    <BreadcrumbItem>
      <BreadcrumbLink>{contract.metadata.contract.name}</BreadcrumbLink>
    </BreadcrumbItem>
  )
}

const ContractInfoPage = () => {
  const { params: { contractId } } = useMatch()
  const setCurrentContractId = useUpdateAtom(currentContractIdAtom)
  useEffect(() => {
    setCurrentContractId(contractId)
  }, [ contractId, setCurrentContractId ])
  return (
    <div>
      <Breadcrumb separator={<BiChevronRight color="gray.500" />} tw="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href='/' to="/">Contracts</BreadcrumbLink>
        </BreadcrumbItem>
        <CurrentContractName />
      </Breadcrumb>
      <Suspense fallback={<div />}>
        <ContractInfo />
      </Suspense>
      <Suspense fallback={<div />}>
        <ContractMethodGrid />
      </Suspense>
    </div>
  )
}

export default ContractInfoPage