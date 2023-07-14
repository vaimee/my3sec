// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ICertificateNFT is IERC721 {
    function safeMint(address to, string memory uri) external returns (uint256);

    function transferOwnership(address newOwner) external;
}
