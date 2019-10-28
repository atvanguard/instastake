import KyberNetworkProxyInterface from '../contracts/KyberNetworkProxyInterface.json';
import Matic from '../contracts/Matic.json';
import MaticInvestor from '../contracts/MaticInvestor.json';
import SynthetixInvestor from '../contracts/SynthetixInvestor.json';
import StakeManager from '../contracts/StakeManager.json';
import InstaStake from '../contracts/InstaStake.json'
import ERC20Artifact from '../contracts/IERC20.json'
import config from '../contracts/config/default.json'

import getWeb3 from '../utils/getWeb3';

const contractMap = {
  [config.contracts.tokens.omg.toLowerCase()]: 'Matic',
  [config.contracts.synthetix.Synthetix.toLowerCase()]: 'SNX'
}

export default class Web3Client {
  constructor(web3) {
    if (web3) this.web3 = web3
  }

  async initialize() {
    if (!this.web3) this.web3 = await getWeb3();
    const networkId = await this.web3.eth.net.getId();
    const deployedNetwork = InstaStake.networks[networkId];

    this.instaStake = new this.web3.eth.Contract(
      InstaStake.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;

    this.kyberNetworkProxyInterface = new this.web3.eth.Contract(
      KyberNetworkProxyInterface.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;

    this.matic = new this.web3.eth.Contract(
      Matic.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;

    this.maticInvestor = new this.web3.eth.Contract(
      MaticInvestor.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;
    
    this.stakeManager = new this.web3.eth.Contract(
      StakeManager.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;

    this.synthetixInvestor = new this.web3.eth.Contract(
      SynthetixInvestor.abi,
      deployedNetwork && deployedNetwork.address
    ).methods;
  }

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    return accounts[0]
  }

  async getPortfolios() {
    if (this.instaStake) {
      const portfolioId = await this.instaStake.portfolioId().call()
      console.log('portfolioId', portfolioId)
      const portfolios = []
      for (let i = 0; i < portfolioId; i++) {
        portfolios.push(await this.getTokenDistribution(i))
      }
      return portfolios
    }
  }

  // async getFirstPortfolio() {
  //   return this.getTokenDistribution(0)
  // }

  async getTokenDistribution(portfolioId) {
    const p = await this.getPortfolio(portfolioId)
    const distribution = []
    for (let j = 0; j < p.tokens.length; j++) {
      distribution.push([
        contractMap[p.tokens[j].toLowerCase()],
        parseInt(p.weights[j], 10)
      ])
    }
    return distribution
  }

  getPortfolio(portfolioId) {
    return this.instaStake.getPortfolio(portfolioId).call()
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
    console.log('portfolio ', portfolio);
  }
}
