import React from 'react'
import tw from 'twin.macro'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Heading,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-location'
import { BiChevronRight } from 'react-icons/bi'

import FatContractAttachForm from '@/features/phat-contract/components/fat-contract-attach-form'


const ContractAttachPage = () => {
  return (
    <div>
      <Breadcrumb separator={<BiChevronRight color="gray.500" />} tw="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href='/' to="/">Contracts</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Box tw="w-full">
        <Heading tw="mb-4">
          Attach to a deployed contract
        </Heading>
        <FatContractAttachForm />
      </Box>
    </div>
  )
}

export default ContractAttachPage