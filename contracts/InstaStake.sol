pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IToken } from "./IToken.sol";
import { KyberNetworkProxyInterface } from "./kyber/KyberNetworkProxyInterface.sol";
import { FundManagerAcl } from "./FundManagerAcl.sol";

contract InstaStake is FundManagerAcl {
  uint256 constant internal MAX_QTY = 10 ** 28; // 10B tokens

  KyberNetworkProxyInterface public kyberProxy;
  address payable public vault;

  struct Portfolio {
    IERC20[] tokens;
    uint8[] weights;
  }

  uint8 public portfolioId;
  // portfolioId to Portfolio
  mapping(uint8 => Portfolio) portfolios;
  mapping(address => address) public iTokens;

  constructor(address _kyberProxy, address payable _vault) public {
    kyberProxy = KyberNetworkProxyInterface(_kyberProxy);
    vault = _vault;
  }

  function createPortfolio(IERC20[] calldata tokens, uint8[] calldata weights) external onlyFundManager {
    for(uint8 i = 0; i < tokens.length; i++) {
      if (iTokens[address(tokens[i])] == address(0x0)) {
        iTokens[address(tokens[i])] = address(new IToken());
      }
    }
    portfolios[portfolioId++] = Portfolio(tokens, weights);
  }

  function buy(uint8 portfolioStrategy, IERC20 srcToken, uint256 amount) external {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.tokens.length > 0, "Invalid portfolio ID");
    require(
      srcToken.transferFrom(msg.sender, address(this), amount),
      "srcToken transfer failed"
    );
    require(
      srcToken.approve(address(kyberProxy), amount),
      "srcToken approve failed"
    );
    for (uint8 i = 0; i < portfolio.tokens.length; i++) {
      IERC20 destToken = portfolio.tokens[i];
      uint256 srcQty = (amount * portfolio.weights[i]) / 100;
      // Get the minimum conversion rate
      (uint256 minConversionRate,) = kyberProxy.getExpectedRate(srcToken, destToken, srcQty);
      swapTokenToToken(
        srcToken,
        srcQty,
        destToken,
        minConversionRate
      );

      // mint equivalent amount of iTokens to the users account
      // @todo mint in proportion to pool size
      IToken(iTokens[address(portfolio.tokens[i])]).mint(msg.sender, srcQty);
    }
  }

  function swapTokenToToken(IERC20 src, uint srcAmount, IERC20 dest, uint minConversionRate) internal {
    bytes memory hint;
    kyberProxy.tradeWithHint(
      src,
      srcAmount,
      dest,
      vault,
      MAX_QTY,
      minConversionRate,
      address(0),
      hint
    );
  }

  // function buyDummy(IERC20 srcToken, uint256 amount, IERC20 destToken) public {
  //   require(
  //     srcToken.transferFrom(msg.sender, address(this), amount),
  //     "srcToken transfer failed"
  //   );
  //   require(
  //     srcToken.approve(address(kyberProxy), amount),
  //     "srcToken approve failed"
  //   );
  //   (uint256 minConversionRate,) = kyberProxy.getExpectedRate(srcToken, destToken, amount);
  //   swapTokenToToken(srcToken, amount, destToken, minConversionRate);
  // }
}
