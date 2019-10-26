pragma solidity ^0.5.11;

/**
 * @title RewardsDistribution interface
 */
interface IRewardsDistribution {
    function distributeRewards(uint amount) external;
}
