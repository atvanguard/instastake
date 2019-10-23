pragma solidity ^0.5.11;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { StakeManager as IStakeManager } from "./matic-protocol/StakeManager.sol";

import { FundManagerAcl } from "../FundManagerAcl.sol";
import { DelegatorContract } from "./DelegatorContract.sol";
import { Investor } from "../Investor.sol";

contract MaticInvestor is Investor, FundManagerAcl, ERC20 {
  IStakeManager stakeManager;
  ERC20 public token;

  uint256[] public whitelistedValidators;

  constructor(address _stakeManager, address _token) public {
    stakeManager = IStakeManager(_stakeManager);
    token = ERC20(_token);
  }

  function whitelistValidator(uint256 validatorId) public /* onlyFundManager */ {
    whitelistedValidators.push(validatorId);
  }

  function invest(address user, uint256 amount) external /* onlyInstaStake */ {
    require(
      token.transfer(address(stakeManager), amount),
      "invest: Token transfer failed"
    );

    // bond equal amounts to all validators
    uint256 _amount = amount / whitelistedValidators.length;
    for(uint8 i = 0; i < whitelistedValidators.length; i++) {
      uint256 validatorId = whitelistedValidators[i];
      stakeManager.bondToValidator(validatorId, _amount);
    }

    // @todo Mint in proportion to the current pool size
    _mint(user, amount);
  }
}
