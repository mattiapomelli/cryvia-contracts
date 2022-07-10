import hre, { ethers } from 'hardhat'
import { TOKEN_ADDRESS } from '../constants/addresses'
import { Quiz } from '../typechain-types'

import { deployContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  const networkName = hre.network.name

  console.log('Deploying on ', networkName)
  console.log('Using address: ', accounts[0].address)

  // Check signer balance
  const balanceBN = await accounts[0].getBalance()
  const balance = Number(ethers.utils.formatEther(balanceBN))

  console.log(`Wallet balance: ${balance} ETH`)
  if (balance < 0.01) {
    throw new Error('Not enough ether')
  }

  // Deploy quiz contract
  console.log('Using token: ', TOKEN_ADDRESS[networkName])

  const quizContract = await deployContract<Quiz>(
    'Quiz',
    TOKEN_ADDRESS[networkName]
  )

  console.log('Deployed Quiz contract at address: ', quizContract.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
