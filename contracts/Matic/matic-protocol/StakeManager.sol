pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/ownership/Ownable.sol";

// import { DelegationManager } from "./DelegationManager.sol";

contract StakeManager is Ownable {
  struct Delegator {
    address delegator;
    uint256 amount;
  }

  struct Validator {
    address signer;
    uint256 stake;
    uint256 reward;
    uint256 bondedAmount;
    Delegator[] delegators;
    mapping(address => uint256) delegatorMapping;
  }
  uint256 public validatorID;
  mapping (uint256 => Validator) public validators;
  IERC20 public token;
  uint256 public totalDelegated;

  constructor(address _token) public {
    token = IERC20(_token);
  }

  modifier isValidator(uint256 validatorId) {
    require(
      validators[validatorId].stake != 0,
      "Invalid validator Id"
    );
    _;
  }

  function stake(uint256 amount) external {
    stakeFor(msg.sender, amount);
  }

  function stakeFor(address user, uint256 amount) public {
    require(
      token.transferFrom(msg.sender, address(this), amount),
      "Transfer stake failed"
    );
    Validator storage validator = validators[validatorID++];
    validator.signer = user;
    validator.stake = amount;
    validator.delegators.length++; // need to start inserting from 1st position
  }

  function bondToValidator(uint256 validatorId, uint256 amount) public isValidator(validatorId) {
    address delegator = msg.sender;
    // require(
    //   token.transferFrom(delegator, address(this), amount),
    //   "Transfer stake failed"
    // );
    validators[validatorId].bondedAmount += amount;
    uint256 index = validators[validatorId].delegatorMapping[delegator];
    if (index == 0) {
      validators[validatorId].delegatorMapping[delegator] = validators[validatorId].delegators.length;
      validators[validatorId].delegators.push(Delegator(delegator, amount));
    } else {
       validators[validatorId].delegators[index].amount += amount;
    }
    totalDelegated += amount;
  }

  // Make sure distributeRewards is called before this
  function unbondFromValidator(uint256 validatorId, uint256 amount) public isValidator(validatorId) {
    Validator storage validator = validators[validatorId];
    uint256 index = validator.delegatorMapping[msg.sender];
    Delegator storage delegate = validator.delegators[index];
    require(
      delegate.amount >= amount,
      "unbondFromValidator: Withdrawing more"
    );
    delegate.amount -= amount;
    validator.bondedAmount -= amount;
    totalDelegated -= amount;
    require(
      token.transfer(msg.sender, delegate.amount),
      "Reward Transfer failed"
    );
  }

  function rewardValidator(uint256 validatorId, uint256 amount) public /* onlyOwner */ isValidator(validatorId) {
    require(
      token.transferFrom(msg.sender, address(this), amount),
      "Transfer reward failed"
    );
    validators[validatorId].reward += amount;
  }

  function distributeRewards(uint256 validatorId) public isValidator(validatorId) returns(bool) {
    Validator storage validator = validators[validatorId];
    if (validator.reward == 0) return true;
    uint256 totalStake = validator.stake + validator.bondedAmount;
    for (uint256 i = 0; i < validator.delegators.length; i++) {
      uint256 reward = (validator.reward * validator.delegators[i].amount) / totalStake;
      validator.delegators[i].amount += reward;
      totalDelegated += reward;
      validator.reward -= reward;
    }
    // give reward to validator
    validator.stake += validator.reward;
    validator.reward = 0;
    return true;
  }
}
