import 'dotenv/config'
import { ethers } from 'hardhat'

import { getQuizContract } from '../utils/contracts'

async function main() {
  const quizContract = getQuizContract()

  const price = await quizContract.quizPrice(3)
  const fund = await quizContract.quizFund(3)

  const info = {
    price: ethers.utils.formatEther(price),
    fund: ethers.utils.formatEther(fund),
  }

  console.log(info)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
