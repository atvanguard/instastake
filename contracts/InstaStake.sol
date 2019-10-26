pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
  mapping(uint8 => Portfolio) public portfolios;

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

  function buy(uint8 portfolioStrategy, IERC20[] calldata srcTokens, uint256 amount) external {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.assets.length > 0, "Invalid portfolio ID");
    for (uint8 i = 0; i < portfolio.assets.length; i++) {
      Asset storage asset = portfolio.assets[i];
      IERC20 destToken = asset.token;
      IERC20 srcToken = srcTokens[i];
      uint256 srcQty = (amount * asset.weight) / 100;
      address payable destAddress = address(uint160(address(asset.tokenInvestor)));

      uint256 destAmount;
      if (address(destToken) == address(srcToken)) {
        // user wants to pay directly with the destToken
        require(
          destToken.transferFrom(msg.sender, destAddress, srcQty),
          "destToken.transferFrom failed"
        );
        destAmount = srcQty;
      } else {
        // obtain destToken from Kyber swap
        require(
          srcToken.transferFrom(msg.sender, address(this), amount),
          "srcToken transfer failed"
        );
        require(
          srcToken.approve(address(kyberProxy), amount),
          "srcToken approve failed"
        );
        // Get the minimum conversion rate
        uint256 minConversionRate;
        (minConversionRate,) = kyberProxy.getExpectedRate(srcToken, destToken, srcQty);
        swapTokenToToken(
          srcToken,
          srcQty,
          destToken,
          destAddress,
          minConversionRate
        );
        // @todo cehck partial fills
        destAmount = (srcQty / (10 ** 18)) * minConversionRate; // works for whole numbers of srcQty
      }
      asset.tokenInvestor.invest(msg.sender, destAmount);
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
