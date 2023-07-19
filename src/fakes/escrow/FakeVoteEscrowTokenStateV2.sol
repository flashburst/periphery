// Neptune Mutual Protocol (https://neptunemutual.com)
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

abstract contract FakeVoteEscrowTokenStateV2 {
  // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //                                           Version 1
  // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  uint256 public constant _MIN_DURATION_IN_WEEKS = 1;
  uint256 public constant _MAX_DURATION_IN_WEEKS = 208;

  address public _underlyingToken;
  address public _feeTo;
  uint256 public _totalLocked;

  // slither-disable-start uninitialized-state
  mapping(address => bool) public _whitelist;
  mapping(address => bool) public _pausers;

  mapping(address => uint256) public _balances;
  mapping(address => uint256) public _unlockAt;
  mapping(address => uint256) public _minUnlockHeights;
  // slither-disable-end uninitialized-state

  // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //                                           Version 2
  // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  string public _name;
  address public _treasury;
  uint256 public _lastInitializedOn;
  mapping(address => bool) public _members;
  mapping(address => uint256) public _boosts;
}
