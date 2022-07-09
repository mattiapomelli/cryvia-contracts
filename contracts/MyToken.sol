// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(address[] memory _users) ERC20("My Token", "MTK") {
        for (uint256 i = 0; i < _users.length; i++) {
            // Give 100 tokens to every user to make tests
            _mint(_users[i], 100 * (10**18));
        }
    }

    /**
     * TODO: remove for production
     */
    fallback() external {}
}
