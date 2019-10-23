pragma solidity ^0.5.11;

interface Investor {
  function invest(address user, uint256 amount) external;
}
