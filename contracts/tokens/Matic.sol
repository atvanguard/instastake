pragma solidity ^0.5.11;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Matic is ERC20 {
  function mint(address account, uint256 amount) public {
    _mint(account, amount);
  }
}
