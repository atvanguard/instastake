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
    uint256 weight;
  }

  struct Portfolio {
    Asset[] assets;
  }

  uint8 public portfolioId;
  // portfolioId to Portfolio
  mapping(uint8 => Portfolio) portfolios;

  event NewPortfolio(uint8 portfolioId);

  constructor(address _kyberProxy) public {
    kyberProxy = KyberNetworkProxyInterface(_kyberProxy);
  }

  function createPortfolio(IERC20[] calldata tokens, Investor[] calldata investorContracts, uint256[] calldata weights) external onlyFundManager {
    Portfolio storage portfolio = portfolios[portfolioId];
    for(uint8 i = 0; i < tokens.length; i++) {
      Asset memory asset = Asset(tokens[i], investorContracts[i], weights[i]);
      portfolio.assets.push(asset);
    }
    emit NewPortfolio(portfolioId++);
  }

  function getPortfolio(uint8 portfolioStrategy)
    public view
    returns(address[] memory tokens, address[] memory investors, uint256[] memory weights)
  {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    uint256 length = portfolio.assets.length;
    tokens = new address[](length);
    investors = new address[](length);
    weights = new uint256[](length);

    for (uint256 i = 0; i < length; i++) {
      Asset storage asset = portfolio.assets[i];
      tokens[i] = address(asset.token);
      investors[i] = address(asset.tokenInvestor);
      weights[i] = asset.weight;
    }
  }

  function buy2(uint8 portfolioStrategy, IERC20 srcToken, uint256 amount)
    external view
    returns(uint256[] memory q, address[] memory  b, address[] memory c){
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.assets.length > 0, "Invalid portfolio ID");
    q = new uint256[](portfolio.assets.length);
    b = new address[](portfolio.assets.length);
    c = new address[](portfolio.assets.length);
    for (uint256 i = 0; i < portfolio.assets.length; i++) {
      Asset storage asset = portfolio.assets[i];
      IERC20 destToken = asset.token;
      uint256 srcQty = (amount * asset.weight) / 100;
      q[i] = srcQty;
      b[i] = address(destToken);
      c[i] = address(asset.tokenInvestor);
    }
  }

  function buy(uint8 portfolioStrategy, IERC20 srcToken, uint256 amount) external {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.assets.length > 0, "Invalid portfolio ID");
    // obtain destToken from Kyber swap
    require(
      srcToken.transferFrom(msg.sender, address(this), amount),
      "srcToken transfer failed"
    );
    require(
      srcToken.approve(address(kyberProxy), amount),
      "srcToken approve failed"
    );

    for (uint256 i = 0; i < portfolio.assets.length; i++) {
      Asset storage asset = portfolio.assets[i];
      IERC20 destToken = asset.token;
      uint256 srcQty = (amount * asset.weight) / 100;
      address payable destAddress = address(uint160(address(asset.tokenInvestor)));
      if (srcQty == 0) continue;

      // synthetix doesnt work with kyber swap locally, as a hack pull directly from users account
      if (address(destToken) == 0xcB09297151aE94f46a73c2d7c04B0F2c30f64494) {
        require(
          destToken.transferFrom(msg.sender, destAddress, srcQty),
          "srcToken transfer failed"
        );
        asset.tokenInvestor.invest(msg.sender, srcQty);
        continue;
      }

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
      // @todo check partial fills
      uint256 destAmount = (srcQty / (10 ** 18)) * minConversionRate; // works for whole numbers of srcQty
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
