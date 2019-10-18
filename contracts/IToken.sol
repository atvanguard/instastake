pragma solidity ^0.5.11;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/ownership/Ownable.sol";

contract IToken is Ownable, ERC20 {
  function mint(address account, uint256 amount) public onlyOwner {
    _mint(account, amount);
  }
}