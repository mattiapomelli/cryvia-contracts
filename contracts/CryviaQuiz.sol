// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CryviaQuiz is Ownable {
    IERC20 public token;

    struct Quiz {
        // Price of the quiz
        uint128 price;
        // Balance accumulated with quiz subcription fees
        uint256 balance;
        // Who is subscribed to the quiz
        mapping(address => bool) subscriptions;
        // How much a user has won
        mapping(address => uint256) winBalance;
        // How much a user can redeem
        mapping(address => uint256) redeemBalance;
    }

    // Existing quizzes
    mapping(uint256 => Quiz) quizzes;

    // How much the owner can withdraw
    uint256 public ownerBalance;

    // Fee kept by the the platform for every quiz subscription (expressed as a percentage)
    uint8 public platformFee = 10;

    constructor(IERC20 _tokenContract) {
        token = _tokenContract;
    }

    function getQuizPrice(uint256 _quizId) public view returns (uint128) {
        return quizzes[_quizId].price;
    }

    function getQuizBalance(uint256 _quizId) public view returns (uint256) {
        return quizzes[_quizId].balance;
    }

    function isSubscribed(uint256 _quizId) public view returns (bool) {
        return quizzes[_quizId].subscriptions[_msgSender()];
    }

    function winBalance(uint256 _quizId) public view returns (uint256) {
        return quizzes[_quizId].winBalance[_msgSender()];
    }

    function redeemBalance(uint256 _quizId) public view returns (uint256) {
        return quizzes[_quizId].redeemBalance[_msgSender()];
    }

    /**
     * Create a new quiz, setting its price
     * @param _id id of the quiz
     * @param _price price for subscribing to the quiz
     */
    function createQuiz(uint256 _id, uint128 _price) external onlyOwner {
        quizzes[_id].price = _price;
    }

    /**
     * Subscribes the caller to a given quiz, after paying the subscription fee
     * @param _quizId id of the quiz to suscribe to
     */
    function subscribe(uint256 _quizId) external {
        uint256 price = quizzes[_quizId].price;

        // TODO: check user hasn't already subscribed

        // Check allowance is enough
        require(
            token.allowance(_msgSender(), address(this)) >= price,
            "Insufficient Allowance"
        );

        // Transfer quiz fee to smart contract
        require(
            token.transferFrom(_msgSender(), address(this), price),
            "Transfer Failed"
        );

        // Update owner balance
        uint256 ownerFee = (price * platformFee) / 100;
        ownerBalance += ownerFee;

        // Update quiz fund
        quizzes[_quizId].balance += price - ownerFee;

        // Add user to quiz partecipants
        quizzes[_quizId].subscriptions[_msgSender()] = true;
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
        uint256 winAmount = quizzes[_quizId].balance / _winners.length;

        // Since divisions truncate to an integer, a small extra amount of the quiz fund could be ignored.
        // For simplicity we give this tiny amount to the owner, since it is not possible to be shared between winners
        uint256 extraAmount = quizzes[_quizId].balance -
            (winAmount * _winners.length);
        ownerBalance += extraAmount;

        for (uint256 i = 0; i < _winners.length; i++) {
            // Check that the winner has actually participated to the quiz
            require(
                quizzes[_quizId].subscriptions[_winners[i]],
                "Winner must be a participant of the quiz"
            );

            // Update winner's win balance and redeem balance
            quizzes[_quizId].winBalance[_winners[i]] = winAmount;
            quizzes[_quizId].redeemBalance[_winners[i]] = winAmount;
        }
    }

    /**
     * Sends to the caller its win balance for a given quiz.
     * @param _quizId id of the quiz
     */
    function redeem(uint256 _quizId) external {
        // Check user has a win balance to redeem
        require(
            quizzes[_quizId].redeemBalance[_msgSender()] > 0,
            "There is no balance to redeem"
        );

        // Transfer redeem balance to user
        token.transfer(
            _msgSender(),
            quizzes[_quizId].redeemBalance[_msgSender()]
        );

        // TODO: update quiz Fund?

        // Reset user's redeem balance
        quizzes[_quizId].redeemBalance[_msgSender()] = 0;
    }

    /**
     * Sends accumulated platform fees to owner
     */
    function withdraw() external onlyOwner {
        token.transfer(_msgSender(), ownerBalance);
        ownerBalance = 0;
    }

    /**
     * TODO: remove for production
     */
    fallback() external {}
}
