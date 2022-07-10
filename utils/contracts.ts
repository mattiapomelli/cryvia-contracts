import { Contract } from 'ethers'
import { ethers } from 'hardhat'

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
