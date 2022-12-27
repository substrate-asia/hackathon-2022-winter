import type { ChangeEvent } from 'react'

import { useCallback } from "react"
import { useSetAtom } from "jotai"

import { localContractsAtom } from "../atoms"

export default function useLocalContractsImport() {
  const saveContract = useSetAtom(localContractsAtom)
  // TODO validation
  return useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target && evt.target.files && evt.target.files.length) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        try {
          const contract = JSON.parse(reader.result as string)
          console.log('load', contract)
          if (!contract || !contract.source || !contract.source.hash) {
            // set(contractParserErrorAtom, "Your contract file is invalid.")
            console.log('import error: Your contract file is invalid')
            return
          }
          if (!contract.V3) {
            console.log('import error: Your contract metadata version is too low, Please upgrade your cargo-contract with `cargo install cargo-contract --force`.')
            // set(contractParserErrorAtom, "Your contract metadata version is too low, Please upgrade your cargo-contract with `cargo install cargo-contract --force`.")
            return
          }
          if (!contract.phat || !contract.phat.contractId) {
            console.log('import error: For now only support metadata that export from contract UI.')
            // set(contractParserErrorAtom, "Your contract metadata version is too low, Please upgrade your cargo-contract with `cargo install cargo-contract --force`.")
            return
          }
          const { phat, wasm, ...metadata } = contract
          saveContract(exists => ({ ...exists, [phat.contractId]: {metadata, contractId: phat.contractId, savedAt: Date.now()} }))
        } catch (e) {
          console.error(e)
          // set(contractParserErrorAtom, `Your contract file is invalid: ${e}`)
        } finally {
          evt.target.value = ''
        }
      })
      reader.readAsText(evt.target.files[0], 'utf-8')
    }
    // const file = inputEl.target.files[0]
    // saveContract(exists => ({ ...exists, [contractId]: {metadata, contractId, savedAt: Date.now()} }))
  }, [saveContract])
}