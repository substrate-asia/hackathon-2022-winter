import { FC, ReactNode, useEffect } from 'react'

import React, { Suspense, useState } from 'react'
import tw from 'twin.macro'
import {
  Button,
  Spinner,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  Input,
  InputGroup,
} from '@chakra-ui/react'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom, waitForAll } from 'jotai/utils'
import { useNavigate } from '@tanstack/react-location'
import { find } from 'ramda'

import { Select } from '@/components/inputs/select'
import { candidateAtom, currentClusterIdAtom, availableClusterOptionsAtom, candidateFileInfoAtom, pruntimeURLAtom, instantiateTimeoutAtom, contractAttachTargetAtom } from '../atoms'
import useAttachToContract from '../hooks/useAttachToContract'
import ContractFileUpload from './contract-upload'

const ClusterIdSelect = () => {
  const [clusterId, setClusterId] = useAtom(currentClusterIdAtom)
  const options = useAtomValue(availableClusterOptionsAtom)
  useEffect(() => {
    if (options && options.length > 0) {
      setClusterId(prev => {
        if (!prev) {
          return options[0].value
        }
        const result = find(i => i.value === prev, options)
        if (!result) {
          return options[0].value
        }
        return prev
      })
    }
  }, [setClusterId, options])
  if (!options.length) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>RPC is not Ready</AlertTitle>
      </Alert>
    )
  }
  return (
    <Select value={clusterId} onChange={setClusterId} options={options} />
  )
}

const AttachContractField = () => {
  const [target, setTarget] = useAtom(contractAttachTargetAtom)
  useState(false)
  function checkAndSetTarget(contractId: string) {
    contractId = contractId.trim()
    if (contractId.startsWith('0x') && contractId.length == (2 + 32 * 2)) {
      setTarget(contractId)
    }
  }
  return (
    <FormControl>
      <FormLabel>Contract Id</FormLabel>
      <InputGroup>
        <Input
            type='url'
            value={target}
            onChange={ev => checkAndSetTarget(ev.target.value)}
          />
        </InputGroup>
    </FormControl>
  )
}

const SuspenseFormField: FC<{ label: string, children: ReactNode }> = ({ label, children }) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <div>
        <Suspense fallback={<Skeleton height="40px" />}>
          {children}
        </Suspense>
      </div>
    </FormControl>
  )
}

const SubmitButton = () => {
  const [candidate, clusterId] = useAtomValue(waitForAll([
    candidateAtom,
    currentClusterIdAtom,
  ]))
  const contractId = useAtomValue(contractAttachTargetAtom)
  const resetContractFileInfo = useResetAtom(candidateFileInfoAtom)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const attachToContract = useAttachToContract()
  const navigate = useNavigate()
  
  const isDisabled = !(clusterId)
  
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (!candidate) {
        toast({
          title: 'Please choose a contract file first.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      if (!contractId) {
        toast({
          title: 'Please enter a valid contract address.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      if (candidate) {
        const succeeded = await attachToContract(candidate, clusterId, contractId)
        resetContractFileInfo()
        if (succeeded) {        
          navigate({ to: `/contracts/view/${contractId}` })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Button size="lg" onClick={handleSubmit} isDisabled={isDisabled} isLoading={isLoading}>
      Submit
    </Button>
  )
}

const FatContractAttachForm = () => {
  return (
    <div>
      <VStack
        my={4}
        p={4}
        spacing={4}
        align="left"
        bg="gray.700"
      >
        <ContractFileUpload />
        <SuspenseFormField label="Cluster ID">
          <ClusterIdSelect />
        </SuspenseFormField>
        <AttachContractField />
      </VStack>
      <div tw="mb-4 w-full flex justify-end">
        <Suspense fallback={<Button><Spinner /></Button>}>
          <SubmitButton />
        </Suspense>
      </div>
    </div>
  )
}

export default FatContractAttachForm