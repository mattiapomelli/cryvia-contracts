// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Quiz is Ownable {
    ERC20 public token;

    constructor(ERC20 _tokenContract) {
        token = _tokenContract;
    }

    // How much a user can redeem for each quiz (quizId -> userAddress -> winAmount)
    mapping(uint256 => mapping(address => uint256)) public winBalance; // rename to redeemBalance?

    // Total win to be redistributed for each quiz (quizId -> fund)
    mapping(uint256 => uint256) public quizFund; // rename to quizBalance?

    // Participants of every quiz (quizId -> userAddress -> isParticipant)
    mapping(uint256 => mapping(address => bool)) public isSubscribed;

    // How much the owner can withdraw
    uint256 public ownerBalance;

    // Price to participate to a quiz (quizId -> price)
    mapping(uint256 => uint256) public quizPrice;

    // Fee kept by the the platform for every quiz subscription (expressed as a percentage)
    uint256 public platformFee = 10;

    /**
     * Create a new quiz, setting its price
     * @param _id id of the quiz
     * @param _price price to subscribe to the quiz
     */
    function createQuiz(uint256 _id, uint256 _price) external onlyOwner {
        quizPrice[_id] = _price;
    }

    /**
     * Subscribes the caller to a given quiz, after paying the subscription fee
     * @param _quizId id of the quiz to suscribe to
     */
    function subscribe(uint256 _quizId) external {
        uint256 fee = quizPrice[_quizId];

        // TODO: check user hasn't already subscribed

        // Check allowance is enough
        require(
            token.allowance(msg.sender, address(this)) >= fee,
            "Insufficient Allowance"
        );

        // Transfer quiz fee to smart contract
        require(
            token.transferFrom(msg.sender, address(this), fee),
            "Transfer Failed"
        );

        // Update owner balance
        ownerBalance += (fee * platformFee) / 100;

        // Update quiz fund
        quizFund[_quizId] += (fee * (100 - platformFee)) / 100;

        // Add user to quiz partecipants
        isSubscribed[_quizId][msg.sender] = true;
    }

    /**
     * Updates the win balance of the winners for a given quiz
     * @param _quizId the id of the quiz
     * @param _winners the list of winners
     */
    function setWinners(uint256 _quizId, address[] calldata _winners)
        external
        onlyOwner
    {
        // TODO: check winners haven't been set yet for this quiz

        // Equally share the win between all winners
        uint256 winAmount = quizFund[_quizId] / _winners.length;

        // Since divisions truncate to an integer, a small extra amount of the quiz fund could be ignored.
        // For simplicity we give this tiny amount to the owner, since it is not possible to be shared between winners
        uint256 extraAmount = quizFund[_quizId] % _winners.length;
        ownerBalance += extraAmount;

        for (uint256 i = 0; i < _winners.length; i++) {
            // Check that the winner has actually participated to the quiz
            require(
                isSubscribed[_quizId][_winners[i]],
                "Winner must be a participant of the quiz"
            );

            // Update winner's win balance
            winBalance[_quizId][_winners[i]] = winAmount;
        }
    }

    /**
     * Sends to the caller its win balance for a given quiz.
     * @param _quizId id of the quiz
     */
    function redeem(uint256 _quizId) external {
        // Check user has a win balance to redeem
        require(
            winBalance[_quizId][msg.sender] > 0,
            "There is no win balance to redeem"
        );

        // Transfer win balance to user
        token.transfer(msg.sender, winBalance[_quizId][msg.sender]);

        // TODO: update quiz Fund?

        // Reset user's win balance
        winBalance[_quizId][msg.sender] = 0;
    }

    /**
     * Sends accumulated platform fees to owner
     */
    function withdraw() external onlyOwner {
        token.transfer(msg.sender, ownerBalance);
        ownerBalance = 0;
    }

    /**
     * TODO: remove for production
     */
    fallback() external {}
}
