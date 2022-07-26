import { ethers } from 'hardhat'
import { MyToken, Quiz } from '../typechain-types'

import { deployContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()

  console.log('Using address: ', accounts[0].address)

  // Deploy token contract
  const myTokenContract = await deployContract<MyToken>(
    'MyToken',
    accounts.slice(0, 5).map((account) => account.address)
  )
  console.log('Deployed MyToken contract at address: ', myTokenContract.address)

  // Deploy quiz contract
  const quizContract = await deployContract<Quiz>(
    'Quiz',
    myTokenContract.address
  )
  console.log('Deployed Quiz contract at address: ', quizContract.address)

  // Create quiz
  quizContract.createQuiz(1, ethers.utils.parseEther('1'))
  console.log('Created quiz 1')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
