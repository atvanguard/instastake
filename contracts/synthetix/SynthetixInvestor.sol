pragma solidity ^0.5.11;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ISynthetix } from "./interfaces/ISynthetix.sol";
import { Investor } from "../Investor.sol";

contract SynthetixInvestor is Investor, ERC20 {
  ISynthetix synthetix;

  constructor(address _synthetix) public {
    synthetix = ISynthetix(_synthetix);
  }

  function invest(address user, uint256 amount) external {
    // 0x73555344 = sUSD
    synthetix.issueSynths(bytes32(uint256(0x73555344) << 224), amount);

    // @todo Mint in proportion to the current pool size
    _mint(user, amount);
  }
}
