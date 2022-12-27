import type { FC } from 'react'
import type { ContractExecuteResult } from '@/features/phat-contract/atoms'

import { Suspense } from 'react'
import { Link } from "@tanstack/react-location"
import tw from 'twin.macro'
import { atom, useAtom } from 'jotai'
import { useUpdateAtom, useAtomValue } from 'jotai/utils'
import {
  TiTick,
  TiInfoOutline,
  TiTimes,
  TiArrowRepeat,
  TiMessageTyping,
  TiCogOutline,
} from 'react-icons/ti'
import {
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import * as R from 'ramda'

import { eventsAtom } from '@/features/parachain/atoms'
import { resultsAtom, pinkLoggerResultAtom } from '@/features/phat-contract/atoms'

const toggleEventListAtom = atom<boolean>(false)
const currentTabAtom = atom<number>(0)

const eventCountsAtom = atom(get => get(eventsAtom).length)
const resultCountsAtom = atom(get => get(resultsAtom).length)
const logCountsAtom = atom(get => get(pinkLoggerResultAtom).length)

const CloseButton = () => {
  const setShowEventList = useUpdateAtom(toggleEventListAtom)
  return (
    <button
      tw="absolute top-2 right-0 p-1 rounded bg-gray-900 hover:bg-phalaDark-500 hover:text-black"
      onClick={() => setShowEventList(false)}
    >
      <TiTimes tw="text-lg" />
    </button>
  )
}

const CounterButton = tw.button`
  flex gap-1 min-w-[2.5rem] justify-center items-center transition-colors text-gray-400 hover:bg-phalaDark-500 hover:text-black
`

const Counters = () => {
  const setShowEventList = useUpdateAtom(toggleEventListAtom)
  const setCurrentTab = useUpdateAtom(currentTabAtom)
  const eventCounts = useAtomValue(eventCountsAtom)
  const resultCounts = useAtomValue(resultCountsAtom)
  const logCounts = useAtomValue(logCountsAtom)
  return (
    <div tw="flex flex-row gap-1">
      <CounterButton
        onClick={() => {
          setShowEventList(true)
          setCurrentTab(0)
        }}
      >
        <TiArrowRepeat tw="text-base" />
        <span tw="text-sm font-mono">{eventCounts}</span>
      </CounterButton>
      <CounterButton
        onClick={() => {
          setShowEventList(true)
          setCurrentTab(1)
        }}
      >
        <TiMessageTyping tw="text-base" />
        <span tw="text-sm font-mono">{resultCounts}</span>
      </CounterButton>
      <CounterButton
        onClick={() => {
          setShowEventList(true)
          setCurrentTab(2)
        }}
      >
        <TiCogOutline tw="text-base" />
        <span tw="text-sm font-mono">{logCounts}</span>
      </CounterButton>
    </div>
  )
}

const QueryResultHistoryItem: FC<ContractExecuteResult> = (result) => {
  const completedAt = new Date(result.completedAt)
  const completedAtString = completedAt.toLocaleString()
  return (
    <div>
      <div tw="flex flex-row gap-3">
        <div tw="rounded-full w-8 h-8 bg-gray-900 flex justify-center items-center border border-solid border-gray-800">
          {result.succeed ? <TiTick tw="text-xl text-phala-500" /> : <TiTimes tw="text-xl text-red-500" />}
        </div>
        <article tw="flex-grow bg-gray-900 border border-solid border-gray-700 rounded-sm px-4 pt-2 pb-3">
          <header tw="flex justify-between pb-2 mb-2 border-b border-solid border-gray-700">
            <Link to={`/contracts/view/${result.contract.contractId}`}>
              <h4 tw="text-sm font-mono px-2 py-1 bg-black rounded-lg inline-block">
                {result.contract.metadata.contract.name}
                .
                {result.methodSpec.label}
              </h4>
              <div tw="text-xs font-mono px-2 my-1 text-gray-400">{result.contract.contractId}</div>
            </Link>
            <time tw="text-sm text-gray-400 mt-1">{completedAtString}</time>
          </header>
          <pre tw="text-base font-mono">
            {typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}
          </pre>
        </article>
      </div>
    </div>
  )
}

const EventPanel = () => {
  const events = useAtomValue(eventsAtom)
  // const reset = useResetAtom(eventsAtom)
  return (
    <div tw="overflow-y-scroll h-[26vh] px-6">
      <div tw="flex flex-col gap-4">
        {!events.length && (
          <div tw="text-gray-600 text-sm flex items-center">
            <TiInfoOutline tw="mr-1 text-lg" />
            Empty.
          </div>
        )}
        {events.map((event, index) => {
          const pairs = R.toPairs(event.data)
          return (
            <article key={index} tw="flex-grow bg-gray-900 border border-solid border-gray-700 rounded-sm px-4 pt-2 pb-3">
              <div>
                <Badge borderRadius='full' px='2' colorScheme='phala' mr="2">{event.section}</Badge>
                <Badge borderRadius='full' px='2' colorScheme='phalaDark'>{event.method}</Badge>
              </div>
              {(pairs.length > 0) && (
                <dl tw="mt-2 px-1 text-xs font-mono">
                  {pairs.map(([key, value]) => (
                    <div tw="my-2 flex flex-row" key={key}>
                      <dt tw="mr-2">{key}:</dt>
                      <dd>{(typeof value === 'string') ? value : JSON.stringify(value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function ResultPanel() {
  const queryResults = useAtomValue(resultsAtom)
  return (
    <div tw="h-[30vh] overflow-y-scroll px-6">
      <div tw="flex flex-col gap-4">
        {!queryResults.length && (
          <div tw="text-gray-600 text-sm flex items-center">
            <TiInfoOutline tw="mr-1 text-lg" />
            Empty.
          </div>
        )}
        {queryResults.map((result, index) => (
          <div key={index}>
            <QueryResultHistoryItem {...result} />
          </div>
        ))}
      </div>
    </div>
  )
}

const Logs = () => {
  const logs = useAtomValue(pinkLoggerResultAtom)
  return (
    <div tw="flex flex-col gap-2 my-4">
      {logs.map((log, i) => {
        if (log.type !== 'MessageOutput') {
        return <div key={i} tw="font-mono text-sm">{JSON.stringify(log)}</div>
        }
        return (
          <div key={i} tw="font-mono text-sm">
            <span tw="mr-1">MessageOutput</span>
            <span tw="mr-1">[#{log.blockNumber}]</span>
            {log.output} {log.decoded && ` - (${log.decoded})`}
          </div>
        )
      })}
    </div>
  )
}

export default function StatusBar() {
  const showEventList = useAtomValue(toggleEventListAtom)
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom)
  return (
    <footer css={[tw`flex-shrink bg-black max-w-full px-4`]}>
      <div css={[showEventList ? tw`h-0 hidden` : tw`h-8`]}>
        <div tw="mx-auto h-full w-full max-w-7xl transition-all flex items-center">
          <Counters />
        </div>
      </div>
      <div
        css={[
          tw`flex flex-row bg-black mx-auto w-full max-w-7xl transition-all`,
          showEventList ? tw`h-auto` : tw`h-0 overflow-hidden`,
        ]}
      >
        <Tabs tw="w-full" colorScheme="phalaDark" index={currentTab} onChange={i => setCurrentTab(i)}>
          <TabList tw="relative">
            <Tab>
              <TiArrowRepeat tw="text-gray-400 text-base mr-1" />
              Events
            </Tab>
            <Tab>
              <TiMessageTyping tw="text-gray-400 text-base mr-1" />
              Result
            </Tab>
            <Tab>
              <TiCogOutline tw="text-gray-400 text-base mr-1" />
              Log
            </Tab>
            <CloseButton />
          </TabList>
          <TabPanels>
            <TabPanel px="0">
              <EventPanel />
            </TabPanel>
            <TabPanel px="0">
              <ResultPanel />
            </TabPanel>
            <TabPanel px="0">
              <div tw="overflow-y-scroll h-[26vh] px-6">
                <Logs />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </footer>
  )
}
