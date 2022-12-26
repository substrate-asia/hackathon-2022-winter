import type { FC } from 'react'
import type { LocalContractInfo } from '@/features/phat-contract/atoms'

import React, { Suspense, useState, useCallback } from 'react'
import tw from 'twin.macro'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { Box, Button, ButtonGroup, Stack, Skeleton } from '@chakra-ui/react'
import { Link, useNavigate } from '@tanstack/react-location'
import { AiOutlineReload, AiOutlinePlus, AiOutlineImport, AiOutlineCloudUpload } from 'react-icons/ai'
import { Keyring } from '@polkadot/keyring'

import { useShowAccountSelectModal } from '@/components/app-ui'
import { currentAccountAtom } from '@/features/identity/atoms'
import { availableContractsAtom, onChainContractsAtom } from '@/features/phat-contract/atoms'
import useLocalContractsImport from '@/features/phat-contract/hooks/useLocalContractsImport'
import { apiPromiseAtom, isDevChainAtom } from '@/features/parachain/atoms'

const ContractListSkeleton = () => (
  <Stack tw="mt-2 mb-4 bg-black p-4 max-w-4xl min-w-full">
    <Box borderWidth='1px' borderRadius='lg' overflow='hidden' my="2" bg="gray.800">
      <Skeleton height='48px' />
    </Box>
  </Stack>
)

const PhalaButton = tw(Button)`
  inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md transition-colors
  text-black bg-phalaDark-500
  hover:bg-gray-900 hover:text-phalaDark-500
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-phala-500
`

const ContractCell: FC<LocalContractInfo> = ({ contractId, metadata, savedAt }) => {
  // convert timestamp savedAt to human readable datetime string
  let dateString = null
  if (savedAt) {
    const date = new Date(savedAt)
    dateString = date.toLocaleString()
  }
  return (
    <Link to={`/contracts/view/${contractId}`}>
      <Box borderWidth='1px' borderRadius='lg' overflow='hidden' my="2" p="2" bg="gray.800" tw="flex flex-row justify-between">
        <div>
          <div tw="font-mono text-xs text-gray-400">
            {contractId.substring(0, 6)}...{contractId.substring(contractId.length - 6)}
          </div>
          <header tw="flex flex-row items-center">
            <h4 tw="text-lg">{metadata.contract.name}</h4>
            <div tw="mt-1 ml-2 text-sm text-gray-200">{metadata.contract.version}</div>
          </header>
        </div>
        <div>
          {dateString && (
            <div tw="text-sm text-gray-400">{dateString}</div>
          )}
        </div>
      </Box>
    </Link>
  )
}

const ContractList = () => {
  const contracts = useAtomValue(availableContractsAtom)
  const account = useAtomValue(currentAccountAtom)
  const showAccountSelectModal = useShowAccountSelectModal()
  const navigate = useNavigate()
  const contractImport = useLocalContractsImport()
  if (contracts.length === 0) {
    return (
      <div tw="bg-black py-6 min-w-full text-center">
        <svg
          tw="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 tw="mt-2 text-sm font-medium text-gray-400">No Contract</h3>
        <p tw="mt-1 text-sm text-gray-500">Get started by uploading a new Phat Contract.</p>
        <div tw="mt-6 mb-4 flex flex-row gap-2 justify-center">
          <PhalaButton
            onClick={() => {
              if (!account) {
                showAccountSelectModal()
                // setConnectionDetailModalVisible(true)
              } else {
                navigate({ to: '/contracts/add' })
              }
            }}
          >
            <AiOutlinePlus tw="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {!!account ? 'Upload' : 'Sign In'}
          </PhalaButton>
          {!!account && (
            <Link to="/contracts/attach">
              <PhalaButton tw="cursor-pointer">
                <AiOutlineCloudUpload tw="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Attach
              </PhalaButton>
            </Link>
          )}
          {!!account && (
            <PhalaButton as="label" tw="cursor-pointer">
              <input type="file" tw="hidden" onChange={contractImport} />
              <AiOutlineImport tw="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Import
            </PhalaButton>
          )}
        </div>
      </div>
    )
  }
  return (
    <>
      <ButtonGroup>
        <Link to="/contracts/add">
          <Button bg="black" borderRadius={0} as="span">Upload</Button>
        </Link>
        <Link to="/contracts/attach">
          <Button bg="black" borderRadius={0} as="span">Attach</Button>
        </Link>
        <Button bg="black" borderRadius={0} as="label" tw="cursor-pointer">
          <input type="file" tw="hidden" onChange={contractImport} />
          Import
        </Button>
        <ReloadButton />
      </ButtonGroup>
      <div tw="mt-2 mb-4 bg-black p-4 max-w-4xl min-w-full">
        {contracts.map(([key, info]) => (
          <div key={key}>
            <ContractCell {...info} />
          </div>
        ))}
      </div>
    </>
  )
}

const ReloadButton = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useUpdateAtom(onChainContractsAtom)
  return (
    <Button
      bg="black"
      borderRadius={0}
      isLoading={loading}
      onClick={() => {
        setLoading(true)
        dispatch({type: 'refetch'})
        setTimeout(() => setLoading(false), 500)
      }}
    >
      <AiOutlineReload />
    </Button>
  )
}

const GetTestPhaButton = () => {
  const api = useAtomValue(apiPromiseAtom)
  const isDevChain = useAtomValue(isDevChainAtom)
  const account = useAtomValue(currentAccountAtom)
  const [loading, setLoading] = useState(false)
  if (!account || !isDevChain) {
    return null
  }
  async function getTestCoin () {
    setLoading(true)
    const keyring = new Keyring({ type: 'sr25519' })
    const pair = keyring.addFromUri('//Alice')
    await api.tx.balances.transferKeepAlive(account?.address, '100000000000000')
      .signAndSend(pair, { nonce: -1 })
    setLoading(false)
  }
  return (
    <Button
      w="full"
      isLoading={loading}
      onClick={getTestCoin}
    >
      Get Test-PHA
    </Button>
  )
}

const ContractListPage = () => {
  return (
    <div tw="grid grid-cols-12 w-full gap-2">
      <div tw="col-span-3 order-2 pl-6">
        <div tw="flex flex-col gap-4">
          <Button w="full" as="a" href="https://wiki.phala.network/" target="_blank">Wiki</Button>
          <Button w="full" as="a" href="https://discord.gg/phala" target="_blank">Discord</Button>
          <Button w="full" as="a" href="https://github.com/Phala-Network/awesome-fat-contracts" target="_blank">
            Awesome Phat Contract
          </Button>
          <Button w="full" as="a" href="https://github.com/Phala-Network/oracle-workshop" target="_blank">
            Oracle Workshop
          </Button>
          <Suspense>
            <GetTestPhaButton />
          </Suspense>
        </div>
      </div>
      <div tw="col-span-9 order-1">
        <Suspense fallback={<ContractListSkeleton />}>
          <ContractList />
        </Suspense>
      </div>
    </div>
  )
}

export default ContractListPage