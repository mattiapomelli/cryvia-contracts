import { ethers } from 'hardhat'
import 'dotenv/config'

import { getQuizContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  const quizContract = getQuizContract()

  console.log('Using address: ', accounts[0].address)

  const id = await readLine('Insert quiz id: ')
  const price = await readLine('Insert quiz price: ')

  console.log('Creating quiz...')

  const tx = await quizContract.createQuiz(id, ethers.utils.parseEther(price))
  await tx.wait()

  console.log('Quiz created. Transaction hash: ', tx.hash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
