// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "../common/access/Whitelistable.sol";
import "../interfaces/IMy3SecProfiles.sol";
import "../libraries/Errors.sol";

contract My3SecProfiles is IMy3SecProfiles, ERC721, ERC721Enumerable, ERC721URIStorage, Whitelistable {
    uint256 private _tokenIdCounter;
    mapping(address => uint256) private _defaultProfileByAddress;

    constructor() ERC721("My3Sec Profiles", "M3SP") {}

    /// @inheritdoc IMy3SecProfiles
    function getDefaultProfileId(address account) external view override returns (uint256) {
        return _defaultProfileByAddress[account];
    }

    /// @inheritdoc IMy3SecProfiles
    function setDefaultProfile(address account, uint256 profileId) external override onlyWhitelisted {
        _setDefaultProfile(account, profileId);
    }

    /// @inheritdoc IMy3SecProfiles
    function createProfile(address to, string memory uri) external override onlyWhitelisted returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        bool isFirstProfile = balanceOf(to) == 1;
        if (isFirstProfile) {
            _setDefaultProfile(to, tokenId);
        }
        return tokenId;
    }

    function _setDefaultProfile(address account, uint256 profileId) internal {
        if (profileId > 0 && account != ownerOf(profileId)) revert Errors.NotProfileOwner();
        _defaultProfileByAddress[account] = profileId;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        if (_defaultProfileByAddress[from] == tokenId) {
            _defaultProfileByAddress[from] = 0;
        }

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage, IMy3SecProfiles) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
