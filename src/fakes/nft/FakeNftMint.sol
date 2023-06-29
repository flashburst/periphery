// Neptune Mutual Protocol (https://neptunemutual.com)
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.12;

import "../../nft/NeptuneLegends.sol";
import "hardhat/console.sol";

contract FakeNftMint is NeptuneLegends {
  function fakeMint(uint256 tokenId) public {
    _minted[tokenId] = true;
    super._safeMint(msg.sender, tokenId, "");
  }
  
  function fakeMintSoulbound(uint256 tokenId) public {
    _soulbound[tokenId] = true;
    super._safeMint(msg.sender, tokenId, "");
  }
}