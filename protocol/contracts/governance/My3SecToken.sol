// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

import "../common/access/HubControllable.sol";

/**
 * @title My3SecToken contract
 * @dev This is the implementation of the ERC20 My3Sec Token.
 *
 * The token is initially owned by the deployer address that can mint tokens to create the initial
 * distribution. For convenience, an initial supply can be passed in the constructor that will be
 * assigned to the deployer.
 *
 * The My3Sec rewards system (to be defined) should be added as a minter to distribute rewards to the users.
 */
contract My3SecToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, HubControllable {
    /**
     * @dev My3Sec Token Contract Constructor.
     * @param initialSupply Initial supply of M3S
     */
    constructor(
        address hub,
        uint256 initialSupply
    ) ERC20("My3Sec Token", "M3S") ERC20Permit("My3Sec Token") HubControllable(hub) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * Mint new tokens.
     * @param to Address to send the newly minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyHub {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
