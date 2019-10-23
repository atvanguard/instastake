pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Kyber Network interface
interface KyberNetworkProxyInterface {
  function swapTokenToToken(IERC20 src, uint srcAmount, IERC20 dest, uint minConversionRate) external;
  function tradeWithHint(IERC20 src, uint srcAmount, IERC20 dest, address payable destAddress, uint maxDestAmount,
      uint minConversionRate, address walletId, bytes calldata hint) external payable returns(uint);
  function maxGasPrice() external view returns(uint);
  function getUserCapInWei(address user) external view returns(uint);
  function getUserCapInTokenWei(address user, IERC20 token) external view returns(uint);
  function enabled() external view returns(bool);
  function info(bytes32 id) external view returns(uint);

  function getExpectedRate(IERC20 src, IERC20 dest, uint srcQty) external view
      returns (uint expectedRate, uint slippageRate);
}
