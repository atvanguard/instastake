import InstaStake from './InstaStake.json'
import ERC20Artifact from './IERC20.json'

import getWeb3 from '../utils/getWeb3';

export default class Web3Client {
  constructor(web3) {
    if (web3) this.web3 = web3
  }

  async initialize() {
    if (!this.web3) this.web3 = await getWeb3();
    const networkId = await this.web3.eth.net.getId();
    console.log('networkId', networkId)
    this.instaStake = new this.web3.eth.Contract(
      InstaStake.abi,
      InstaStake.networks[networkId].address
    ).methods;
  }

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    return accounts[0]
  }

  async getPortfolios() {
    console.log('getPortfolios')
    const portfolioId = await this.instaStake.portfolioId().call()
    console.log('portfolioId', portfolioId)
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
