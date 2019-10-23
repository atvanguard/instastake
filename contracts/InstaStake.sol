pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IToken } from "./IToken.sol";
import { KyberNetworkProxyInterface } from "./kyber/KyberNetworkProxyInterface.sol";
import { FundManagerAcl } from "./FundManagerAcl.sol";
import { Investor } from "./Investor.sol";

contract InstaStake is FundManagerAcl {
  uint256 constant internal MAX_QTY = 10 ** 28; // 10B tokens

  KyberNetworkProxyInterface public kyberProxy;
  address payable public vault;

  struct Asset {
    IERC20 token;
    Investor tokenInvestor;
    uint8 weight;
  }

  struct Portfolio {
    Asset[] assets;
  }

  uint8 public portfolioId;
  // portfolioId to Portfolio
  mapping(uint8 => Portfolio) portfolios;

  constructor(address _kyberProxy) public {
    kyberProxy = KyberNetworkProxyInterface(_kyberProxy);
  }

  function createPortfolio(IERC20[] calldata tokens, Investor[] calldata investorContracts, uint8[] calldata weights) external onlyFundManager {
    Portfolio storage portfolio = portfolios[portfolioId++];
    for(uint8 i = 0; i < tokens.length; i++) {
      Asset memory asset = Asset(tokens[i], investorContracts[i], weights[i]);
      portfolio.assets.push(asset);
    }
  }

  function buy(uint8 portfolioStrategy, IERC20 srcToken, uint256 amount) external {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.assets.length > 0, "Invalid portfolio ID");
    require(
      srcToken.transferFrom(msg.sender, address(this), amount),
      "srcToken transfer failed"
    );
    require(
      srcToken.approve(address(kyberProxy), amount),
      "srcToken approve failed"
    );
    for (uint8 i = 0; i < portfolio.assets.length; i++) {
      Asset storage asset = portfolio.assets[i];
      IERC20 destToken = asset.token;
      uint256 srcQty = (amount * asset.weight) / 100;

      // Get the minimum conversion rate
      (uint256 minConversionRate,) = kyberProxy.getExpectedRate(srcToken, destToken, srcQty);
      address payable destAddress = address(uint160(address(asset.tokenInvestor)));
      swapTokenToToken(
        srcToken,
        srcQty,
        destToken,
        destAddress,
        minConversionRate
      );
      asset.tokenInvestor.invest(msg.sender, destToken.balanceOf(destAddress)); // if partial fills is a thing, srcQty will be a problem
    }
  }

  function swapTokenToToken(
      IERC20 src,
      uint srcAmount,
      IERC20 dest,
      address payable destAddress,
      uint minConversionRate) internal {
    bytes memory hint;
    kyberProxy.tradeWithHint(
      src,
      srcAmount,
      dest,
      destAddress,
      MAX_QTY,
      minConversionRate,
      address(0),
      hint
    );
  }
}
