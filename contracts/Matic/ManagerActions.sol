pragma solidity ^0.5.11;

import { DelegationManager as IDelegationManager } from "matic-protocol/contracts/staking/DelegationManager.sol";
import { FundManagerAcl } from "../FundManagerAcl.sol";

contract ManagerActions is FundManagerAcl {
  IDelegationManager delegationManager;
  uint256 delegatorId;

  constructor(address _delegationManager) public {
    delegationManager = IDelegationManager(_delegationManager);
  }

  function stake(uint256 amount) public onlyFundManager {
    if (delegatorId == 0) {
      delegatorId = delegationManager.NFTCounter();
      delegationManager.stake(amount);
    } else {
      delegationManager.reStake(delegatorId, amount, true /* stakeRewards */);
    }
  }

  function bondToValidator(uint256 validatorId) public onlyFundManager {
    delegationManager.bond(delegatorId, validatorId);
  }
}
