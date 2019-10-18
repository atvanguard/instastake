pragma solidity ^0.5.11;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IToken } from "./IToken.sol";
import { KyberNetworkProxyInterface } from "./kyber/KyberNetworkProxyInterface.sol";
import { FundManagerAcl } from "./FundManagerAcl.sol";

contract InstaStake is FundManagerAcl {
  uint256 constant internal MAX_QTY = 10 ** 28; // 10B tokens

  KyberNetworkProxyInterface public kyber;
  address payable public vault;

  struct Portfolio {
    IERC20[] tokens;
    uint8[] weights;
  }

  uint8 portfolioId;
  // portfolioId to Portfolio
  mapping(uint8 => Portfolio) portfolios;
  mapping(address => address) public iTokens;

  constructor(address _kyber, address payable _vault) public {
    kyber = KyberNetworkProxyInterface(_kyber);
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

  function buy(uint8 portfolioStrategy, IERC20 paymentToken, uint256 amount) external {
    Portfolio storage portfolio = portfolios[portfolioStrategy];
    require(portfolio.tokens.length > 0, "Invalid portfolio ID");
    for (uint8 i = 0; i < portfolio.tokens.length; i++) {
      uint256 _amount = (amount * portfolio.weights[i]) / 100;
      swapTokenToToken(
        paymentToken,
        _amount,
        portfolio.tokens[i],
        // @todo check how kyber.getExpectedRate works
        0 // will the trade never fail if minConversionRate == 0 ?
      );
      // mint equivalent amount of iTokens to the users account
      IToken(iTokens[address(portfolio.tokens[i])]).mint(msg.sender, _amount);
    }
  }

  function swapTokenToToken(IERC20 src, uint srcAmount, IERC20 dest, uint minConversionRate) internal {
    bytes memory hint;
    kyber.tradeWithHint(
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
}