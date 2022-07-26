import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MyToken, CryviaQuiz } from '../typechain-types'
import { deployContract } from '../utils/contracts'

describe('CryviaQuiz Contract', () => {
  let quizContract: CryviaQuiz
  let tokenContract: MyToken
  let owner: SignerWithAddress
  let users: SignerWithAddress[]

  let NUMBER_OF_USERS = 5
  let NUMBER_OF_WINNERS = 3

  const QUIZ_ID = 1
  const QUIZ_PRICE = ethers.utils.parseEther('5')

  before(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    users = accounts.slice(1, NUMBER_OF_USERS + 1)

    tokenContract = await deployContract<MyToken>(
      'MyToken',
      users.map((user) => user.address)
    )

    quizContract = await deployContract<CryviaQuiz>(
      'CryviaQuiz',
      tokenContract.address
    )
  })

  describe('when the contract is deployed', async () => {
    it('sets the deployer as the owner', async () => {
      const contractOwner = await quizContract.owner()
      expect(contractOwner).to.eq(owner.address)
    })

    it('sets the correct token', async () => {
      const token = await quizContract.token()
      expect(token).to.eq(tokenContract.address)
    })
  })

  describe('when a quiz is created', async () => {
    it('sets the correct quiz price', async () => {
      const tx = await quizContract.createQuiz(QUIZ_ID, QUIZ_PRICE)
      await tx.wait()

      const price = await quizContract.getQuizPrice(QUIZ_ID)
      expect(price).to.eq(QUIZ_PRICE)
    })
  })

  for (let i = 0; i < NUMBER_OF_USERS; i++) {
    describe(`when user ${i} subscribes to a quiz`, async () => {
      let quizContractBalance: BigNumber
      let user: SignerWithAddress
      let userBalance: BigNumber
      let quizBalance: BigNumber
      let ownerBalance: BigNumber

      before(async () => {
        user = users[i]

        // Set balances before subscription
        userBalance = await tokenContract.balanceOf(user.address)
        quizContractBalance = await tokenContract.balanceOf(
          quizContract.address
        )
        quizBalance = await quizContract.getQuizBalance(QUIZ_ID)
        ownerBalance = await quizContract.ownerBalance()

        // Approve spending of tokens
        const approveTx = await tokenContract
          .connect(user)
          .approve(quizContract.address, QUIZ_PRICE)
        await approveTx.wait()

        // Subscribe user to quiz
        const subscribeTx = await quizContract.connect(user).subscribe(QUIZ_ID)
        await subscribeTx.wait()
      })

      it("decreases user's token balance", async () => {
        const updatedUserBalance = await tokenContract.balanceOf(user.address)
        expect(updatedUserBalance).to.eq(userBalance.sub(QUIZ_PRICE))
      })

      it('increases quiz contract token balance', async () => {
        const updatedQuizContractBalance = await tokenContract.balanceOf(
          quizContract.address
        )
        expect(updatedQuizContractBalance).to.eq(
          quizContractBalance.add(QUIZ_PRICE)
        )
      })

      it('increases quiz balance', async () => {
        const platformFeePercentage = await quizContract.platformFee()
        const platformFee = QUIZ_PRICE.mul(platformFeePercentage).div(100)

        const updatedQuizBalance = await quizContract.getQuizBalance(QUIZ_ID)
        const paidFee = QUIZ_PRICE.sub(platformFee)
        expect(updatedQuizBalance).to.eq(quizBalance.add(paidFee))
      })

      it('increases owner balance', async () => {
        const platformFeePercentage = await quizContract.platformFee()
        const platformFee = QUIZ_PRICE.mul(platformFeePercentage).div(100)

        const updatedOwnerBalance = await quizContract.ownerBalance()
        expect(updatedOwnerBalance).to.eq(ownerBalance.add(platformFee))
      })

      it('updates quiz subscriptions', async () => {
        const isSubscribed = await quizContract
          .connect(user)
          .isSubscribed(QUIZ_ID)
        expect(isSubscribed).to.eq(true)
      })
    })
  }

  describe('when quiz winners are setted', async () => {
    let winners: SignerWithAddress[]
    let ownerBalance: BigNumber
    let expectedWinBalance: BigNumber
    let quizBalance: BigNumber

    before(async () => {
      winners = users.slice(0, NUMBER_OF_WINNERS)
      ownerBalance = await quizContract.ownerBalance()

      // Set winners
      const tx = await quizContract.setWinners(
        QUIZ_ID,
        winners.map((winner) => winner.address)
      )
      tx.wait()
    })

    it("increases winner's win balance", async () => {
      quizBalance = await quizContract.getQuizBalance(QUIZ_ID)
      expectedWinBalance = quizBalance.div(NUMBER_OF_WINNERS) // Will truncate if result is not integer

      for (const winner of winners) {
        const winBalance = await quizContract
          .connect(winner)
          .winBalance(QUIZ_ID)
        expect(winBalance).to.eq(expectedWinBalance)
      }
    })

    it("increases winner's redeem balance", async () => {
      for (const winner of winners) {
        const redeemBalance = await quizContract
          .connect(winner)
          .redeemBalance(QUIZ_ID)
        expect(redeemBalance).to.eq(expectedWinBalance)
      }
    })

    it('increases owner balance by extra amount', async () => {
      const extraOwnerAmount = quizBalance.sub(
        expectedWinBalance.mul(NUMBER_OF_WINNERS)
      )
      const updatedOwnerBalance = await quizContract.ownerBalance()

      expect(updatedOwnerBalance).to.eq(ownerBalance.add(extraOwnerAmount))
    })
  })
})
