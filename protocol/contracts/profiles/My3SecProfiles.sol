// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "../common/access/HubControllableUpgradeable.sol";
import "../common/interfaces/IMy3SecProfiles.sol";
import "../common/libraries/Errors.sol";

contract My3SecProfiles is
    IMy3SecProfiles,
    HubControllableUpgradeable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable
{
    uint256 private _tokenIdCounter;
    mapping(address => uint256) private _defaultProfileByAddress;

    function initialize(address hub) public initializer {
        __ERC721_init("My3Sec Profiles", "M3SP");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __HubControllable_init(hub);
    }

    /// @inheritdoc IMy3SecProfiles
    function getDefaultProfileId(address account) external view override returns (uint256) {
        return _defaultProfileByAddress[account];
    }

    /// @inheritdoc IMy3SecProfiles
    function setDefaultProfile(address account, uint256 profileId) external override onlyHub {
        _setDefaultProfile(account, profileId);
    }

    /// @inheritdoc IMy3SecProfiles
    function createProfile(address to, string memory uri) external override onlyHub returns (uint256) {
        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        bool isFirstProfile = balanceOf(to) == 1;
        if (isFirstProfile) {
            _setDefaultProfile(to, tokenId);
        }
        return tokenId;
    }

    /// @inheritdoc IMy3SecProfiles
    function updateProfile(uint256 profileId, string memory uri) external onlyHub {
        _setTokenURI(profileId, uri);
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
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        if (_defaultProfileByAddress[from] == tokenId) {
            _defaultProfileByAddress[from] = 0;
        }

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, IMy3SecProfiles) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721EnumerableUpgradeable, ERC721Upgradeable, IERC165Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
