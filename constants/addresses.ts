import { SupportedChainId } from './chains'

export type AddressMap = { [chainId: number]: string }

export const QUIZ_CONTRACT_ADDRESS: AddressMap = {
  [SupportedChainId.LOCAL]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  [SupportedChainId.MUMBAI]: '0xB4B1040E0861082585f94f9D4E4c8F1C176bCA29',
}

export const TOKEN_ADDRESS: AddressMap = {
  [SupportedChainId.LOCAL]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  [SupportedChainId.MUMBAI]: '0x671A584CE1110E07BBaD6958472Bfa4e693e440D',
}
