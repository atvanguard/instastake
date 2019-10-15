pragma solidity ^0.5.11;

import { Ownable } from "@openzeppelin/contracts/ownership/Ownable.sol";

contract FundManagerAcl is Ownable {
  modifier onlyFundManager() {
    require(isOwner(), "Ownable: caller is not the owner");
    _;
  }
}
