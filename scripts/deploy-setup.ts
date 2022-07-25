import { ethers } from 'hardhat'
import { MyToken, Quiz } from '../typechain-types'

import { deployContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const players = accounts.slice(1, 11)

  // Deploy token contract
  const tokenContract = await deployContract<MyToken>(
    'MyToken',
    players.map((account) => account.address)
  )
  console.log('Deployed MyToken contract at address: ', tokenContract.address)

  // Deploy quiz contract
  const quizContract = await deployContract<Quiz>('Quiz', tokenContract.address)
  console.log('Deployed Quiz contract at address: ', quizContract.address)

  // Create quiz
  const QUIZ_PRICE = 5
  const QUIZ_ID = 1

  quizContract.createQuiz(1, ethers.utils.parseEther(QUIZ_PRICE.toString()))
  console.log(`Created quiz ${QUIZ_ID} with price ${QUIZ_PRICE}`)

  // Subscribe players to quiz
  for (const player of players) {
    console.log(`Approving token usage for ${player.address}`)
    const approveTx = await tokenContract
      .connect(player)
      .approve(
        quizContract.address,
        ethers.utils.parseEther(QUIZ_PRICE.toString())
      )
    await approveTx.wait()

    console.log(`Subscribing ${player.address}`)
    const subscribeTx = await quizContract.connect(player).subscribe(QUIZ_ID)
    await subscribeTx.wait()
  }

  // Set winners
  const winners = players.slice(0, 3).map((winner) => winner.address)
  console.log(`Setting winners: ${winners}`)

  await quizContract.setWinners(QUIZ_ID, winners)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
