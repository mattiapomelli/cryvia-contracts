import { Contract, ContractInterface } from 'ethers'
import hre, { ethers } from 'hardhat'
import { Quiz } from '../typechain-types'
import QuizJson from '../artifacts/contracts/Quiz.sol/Quiz.json'

import { AddressMap, QUIZ_CONTRACT_ADDRESS } from '../constants/addresses'
import { getProvider } from './providers'

export async function deployContract<T extends Contract>(
  contractName: string,
  ...args: unknown[]
) {
  // Get contract factory
  const contractFactory = await ethers.getContractFactory(contractName)

  // Deploy contract
  const contract = (await contractFactory.deploy(...args)) as T
  await contract.deployed()

  return contract
}

export function getContract<T extends Contract>(
  addressOrAddressMap: string | AddressMap,
  abi: ContractInterface,
  withSigner = true
) {
  const { config, name } = hre.network
  const provider = getProvider(name)

  const address =
    typeof addressOrAddressMap === 'string'
      ? addressOrAddressMap
      : addressOrAddressMap[config.chainId || 0]

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '')
  const signer = wallet.connect(provider)

  return new Contract(address, abi, withSigner ? signer : provider) as T
}

export function getQuizContract(withSigner = true) {
  return getContract<Quiz>(QUIZ_CONTRACT_ADDRESS, QuizJson.abi, withSigner)
}
