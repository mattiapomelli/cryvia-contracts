import { SupportedChainId } from './chains'

export type AddressMap = { [chainId: number]: string }

export const QUIZ_CONTRACT_ADDRESS: AddressMap = {
  [SupportedChainId.LOCAL]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  [SupportedChainId.MUMBAI]: '0x2601463863F47E9B08e53094dBB724BE89d0Dc49',
}

export const TOKEN_ADDRESS: AddressMap = {
  [SupportedChainId.LOCAL]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  [SupportedChainId.MUMBAI]: '0x9f65240da1a3852B757bC25E9C58EC15305d549E',
}
