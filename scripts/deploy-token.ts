import hre, { ethers } from 'hardhat'
import { MyToken } from '../typechain-types'

import { deployContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  const networkName = hre.network.name

  console.log('Deploying on', networkName)
  console.log('Using address: ', accounts[0].address)

  // Check signer balance
  const balanceBN = await accounts[0].getBalance()
  const balance = Number(ethers.utils.formatEther(balanceBN))

  console.log(`Wallet balance: ${balance} ETH`)
  if (balance < 0.01) {
    throw new Error('Not enough ether')
  }

  // Deploy quiz contract
  const tokenContract = await deployContract<MyToken>('MyToken', [
    '0x8F255911988e25d126608b18cf1B8047D0E8878D',
    '0x30d186Cd44B20085f3EF3E631587390C9fDbf360',
    '0x498c3DdbEe3528FB6f785AC150C9aDb88C7d372c',
    '0x0Ba0C3E897fA7Ee61d177b392bf88A2AEc747fE8',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x51B50bbDAcF8B5D0381EDb0DB19c4A1eD5434c45',
  ])

  console.log('Deployed MyToken contract at address: ', tokenContract.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
