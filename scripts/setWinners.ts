import { ethers } from 'hardhat'
import 'dotenv/config'

import { getQuizContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  const quizContract = getQuizContract()

  console.log('Using address: ', accounts[0].address)

  const id = await readLine('Insert quiz id: ')
  const winnersStr = await readLine('Insert quiz winners: ')
  const winners = winnersStr.split(' ')

  console.log('Setting winners...')

  const tx = await quizContract.setWinners(id, winners)
  await tx.wait()

  console.log('Winners have been set. Transaction hash: ', tx.hash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
