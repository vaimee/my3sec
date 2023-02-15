// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IMy3SecEnergyToken.sol";

/**
 * @title My3SecEnergyToken contract
 * @dev This is the implementation of the My3Sec Energy Token.
 */
contract My3SecEnergyToken is IMy3SecEnergyToken, Ownable {
    mapping(address => uint256) private _balances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * My3Sec Energy Token Contract Constructor.
     */
    constructor() {
        _name = "My3Sec Energy Token";
        _symbol = "M3SE";
    }

    /// @inheritdoc IMy3SecEnergyToken
    function name() external view returns (string memory) {
        return _name;
    }

    /// @inheritdoc IMy3SecEnergyToken
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /// @inheritdoc IMy3SecEnergyToken
    function decimals() external pure returns (uint8) {
        return 18;
    }

    /// @inheritdoc IMy3SecEnergyToken
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /// @inheritdoc IMy3SecEnergyToken
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /// @inheritdoc IMy3SecEnergyToken
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @inheritdoc IMy3SecEnergyToken
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);
    }
}