import InstaStakeArtifact from './InstaStake.json'
import ERC20Artifact from './IERC20.json'

export default class Web3Client {
  constructor(web3) {
    this.web3 = web3
    this.instaStake = new this.web3.Contract(InstaStakeArtifact.abi, '').methods
  }

  async getPortfolios() {
    const portfolioId = await this.instaStake.portfolioId().call()
    const portfolios = []
    for (let i = 0; i < portfolioId; i++) {
      portfolios.push(await this.instaStake.portfolios(i).call())
    }
    return portfolios
  }

  getPortfolio(portfolioId) {
    return this.instaStake.portfolios(portfolioId).call()
  }

  approve(srcToken, amount) {
    const token = new this.web3.Contract(ERC20Artifact.abi, srcToken).methods
    return token.approve(this.instaStake.options.address, amount)
  }

  async buy(portfolioId, srcToken, amount) {
    const portfolio = await this.getPortfolio(portfolioId)
    // @todo for local testing put in the snx fix
    const tokens = [srcToken]
    return this.instaStake.buy(portfolioId, tokens, amount).send()
  }

  async showBalance(portfolioId, user) {
    const portfolio = await this.getPortfolio(portfolioId)
    // @todo for all tokens get user Balance
  }
}
