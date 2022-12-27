import React, { useCallback } from 'react'
import tw from 'twin.macro'
import { useAtomValue } from 'jotai/utils'
import {
  Box,
  Heading,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  Button,
} from "@chakra-ui/react";

import { currentContractAtom, phalaFatContractQueryAtom } from '../atoms'
import Code from '@/components/code'

const StyledTd = tw(Td)`py-4`

const useContractMetaExport = () => {
  const contract = useAtomValue(currentContractAtom)
  return useCallback(() => {
    const meta = contract.metadata
    // @ts-ignore
    meta.phat = { contractId: contract.contractId }
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(meta)));
    element.setAttribute('download', `${contract.metadata.contract.name}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [contract])
}

const ContractInfo = () => {
  const contract = useAtomValue(currentContractAtom)
  const query = useAtomValue(phalaFatContractQueryAtom)
  const handleExport = useContractMetaExport()
  if (!contract)  {
    return null
  }
  return (
    <Box borderWidth="1px" overflow="hidden" my="4" p="8" bg="gray.800">
      <div tw="mb-8 flex justify-between items-center">
        <Heading tw="flex flex-row items-center">
          {contract.metadata.contract.name}
          <Tag tw="ml-4 mt-1">{contract.metadata.contract.version}</Tag>
        </Heading>
        <Button onClick={handleExport}>Export</Button>
      </div>
      <TableContainer>
        <Table size="sm" colorScheme="phalaDark">
          <Tbody>
            <Tr>
              <Th>Contract ID</Th>
              <StyledTd><Code>{contract.contractId}</Code></StyledTd>
            </Tr>
            <Tr>
              <Th>Code Hash</Th>
              <StyledTd><Code>{contract.metadata.source.hash}</Code></StyledTd>
            </Tr>
            <Tr>
              <Th>Language</Th>
              <StyledTd>{contract.metadata.source.language}</StyledTd>
            </Tr>
            <Tr>
              <Th>Compiler</Th>
              <StyledTd>{contract.metadata.source.compiler}</StyledTd>
            </Tr>
            {query && (
              <>
                <Tr>
                  <Th>Developer</Th>
                  <StyledTd><Code>{query.deployer}</Code></StyledTd>
                </Tr>
                <Tr>
                  <Th>ClusterId</Th>
                  <StyledTd><Code>{query.cluster}</Code></StyledTd>
                </Tr>
              </>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ContractInfo