import 'dotenv/config'
import { ethers } from 'hardhat'

import { getTokenContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const tokenContract = getTokenContract()

  const tx = await tokenContract.mint(ethers.utils.parseEther('100').sub(100))
  await tx.wait()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
