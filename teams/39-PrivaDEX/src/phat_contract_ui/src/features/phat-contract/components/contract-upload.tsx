import { useCallback } from 'react'
import tw from 'twin.macro'
import { FormControl, FormLabel, Button, Select } from '@chakra-ui/react'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { useDropzone } from 'react-dropzone'
import { useAtom } from 'jotai'
import { useUpdateAtom, useAtomValue } from 'jotai/utils'

import {
  contractCandidateAtom,
  candidateFileInfoAtom,
  contractParserErrorAtom,
} from "../atoms";

const HelpText = () => {
  const error = useAtomValue(contractParserErrorAtom)
  return error ? (
    <p tw="text-xs text-red-500">
      {error}
    </p>
  ) : (
    <p tw="text-xs text-gray-500">
      The file name of Contract Bundle is ends with .contract
    </p>
  )
}

const Dropzone = () => {
  const setCandidate = useUpdateAtom(contractCandidateAtom)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    // @FIXME also the path / name should ends with `.contract`
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      setCandidate(acceptedFiles[0])
    }
  }, [setCandidate])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop })
  return (
    <div tw="mt-1">
      <div tw="flex justify-center px-6 pt-5 pb-6 bg-gray-300 rounded-sm">
        <div {...getRootProps()} tw="space-y-1 w-full">
          <IoCloudUploadOutline tw="h-8 w-8 text-black mx-auto mb-4" />
          <label tw="flex text-sm justify-center text-gray-600 cursor-pointer">
            <span
              css={tw`
              relative bg-white font-medium text-black px-2
              hover:text-[#f2f2f2] hover:bg-black
              focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500
            `}
            >
              <span>Click to select</span>
              <input {...getInputProps()} tw="sr-only" />
            </span>
            <p tw="pl-1">or drag and drop</p>
          </label>
          <div tw="w-full text-center">
            <HelpText />
          </div>
        </div>
      </div>
    </div>
  );
}

const CandidatePreview = () => {
  const [finfo, setFinfo] = useAtom(candidateFileInfoAtom)
  return (
    <div tw="px-4 flex justify-between items-center">
      <div>
        <p tw="text-sm text-gray-500">
          {finfo.name} ({Math.round(finfo.size / 1024)} kB)
        </p>
      </div>
      <Button
        tw="bg-black text-gray-300 border border-solid border-[#f3f3f3] hover:bg-[#f3f3f3] hover:text-black"
        h="1.75rem"
        mr="0.3rem"
        size="sm"
        onClick={() => setFinfo({ name: '', size: 0 })}
      >
        Change
      </Button>
    </div>
  )
}

const ContractFileUpload = () => {
  const finfo = useAtomValue(candidateFileInfoAtom)
  return (
    <FormControl>
      <FormLabel>Contract File</FormLabel>
      {finfo.size ? (
        <CandidatePreview />
      ) : (
        <Dropzone />
      )}
    </FormControl>
  )
}

export default ContractFileUpload