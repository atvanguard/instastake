pragma solidity ^0.5.11;

import { ISynthetix } from "./ISynthetix.sol";
import { FundManagerAcl } from "../FundManagerAcl.sol";

contract ManagerActions is FundManagerAcl {
  ISynthetix synthetix;

  constructor(address _synthetix) public {
    synthetix = ISynthetix(_synthetix);
  }

  function stake(uint256 amount) public onlyFundManager {
    synthetix.issueSynths(bytes32("sUSD"), amount);
  }
}
