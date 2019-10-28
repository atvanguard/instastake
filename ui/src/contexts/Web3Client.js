import KyberNetworkProxyInterface from '../contracts/KyberNetworkProxyInterface.json';
import Matic from '../contracts/Matic.json';
import MaticInvestor from '../contracts/MaticInvestor.json';
import SynthetixInvestor from '../contracts/SynthetixInvestor.json';
import Synthetix from '../contracts/ISynthetix.json';
import StakeManager from '../contracts/StakeManager.json';
import InstaStake from '../contracts/InstaStake.json'
import ERC20Artifact from '../contracts/IERC20.json'
import config from '../contracts/config/default.json'

import getWeb3 from '../utils/getWeb3';

let SCALING_FACTOR

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
    SCALING_FACTOR = this.web3.utils.toBN(10).pow(this.web3.utils.toBN(18))
    this.instaStake = new this.web3.eth.Contract(
      InstaStake.abi,
      await this.getAddressFromArtifact(InstaStake)
    );

    // this.kyberNetworkProxyInterface = new this.web3.eth.Contract(
    //   KyberNetworkProxyInterface.abi,
    //   deployedNetwork && deployedNetwork.address
    // ).methods;

    // this.matic = new this.web3.eth.Contract(
    //   Matic.abi,
    //   deployedNetwork && deployedNetwork.address
    // ).methods;

    this.maticInvestor = new this.web3.eth.Contract(
      MaticInvestor.abi,
      await this.getAddressFromArtifact(MaticInvestor)
    );

    this.stakeManager = new this.web3.eth.Contract(
      StakeManager.abi,
      await this.getAddressFromArtifact(StakeManager)
    );

    this.synthetixInvestor = new this.web3.eth.Contract(
      SynthetixInvestor.abi,
      await this.getAddressFromArtifact(SynthetixInvestor)
    );

    this.synthetix = new this.web3.eth.Contract(
      Synthetix.abi,
      config.contracts.synthetix.Synthetix
    );
  }

  async getAddressFromArtifact(artifact) {
    const networkId = await this.web3.eth.net.getId();
    console.log('networkId', networkId, artifact.networks)
    if (artifact && artifact.networks && artifact.networks[networkId]) {
      return artifact.networks[networkId].address;
    }
    throw new Error(`address for ${artifact.contractName} not found`)
  }

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    return accounts[0]
  }

  async getPortfolios() {
    if (this.instaStake) {
      const portfolioId = await this.instaStake.methods.portfolioId().call()
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
    return this.instaStake.methods.getPortfolio(portfolioId).call()
  }

  async approve(srcToken, amount) {
    srcToken = srcToken || config.contracts.tokens.knc;
    amount = amount || '0x' + this.web3.utils.toBN(10).mul(SCALING_FACTOR).toString('hex')
    console.log(srcToken, amount, this.instaStake.options.address)
    const token = new this.web3.eth.Contract(ERC20Artifact.abi, srcToken).methods
    console.log('token.balanceOf', await token.balanceOf(await this.getAccount()).call())
    await token.approve(this.instaStake.options.address, amount).send({
      from: await this.getAccount(),
      gas: 100000
    })
  }

  async buy(portfolioId, srcToken, amount) {
    console.log('portfolioId', portfolioId)
    srcToken = srcToken || config.contracts.tokens.knc;
    amount = amount || '0x' + this.web3.utils.toBN(10).mul(SCALING_FACTOR).toString('hex')
    return this.instaStake.methods.buy(parseInt(portfolioId, 10), srcToken, amount).send({
      from: await this.getAccount(),
      gas: 1000000
    })
  }

  async showBalance(portfolioId) {
    const p = await this.getPortfolio(portfolioId)
    const balances = []
    for (let j = 0; j < p.investors.length; j++) {
      const token = new this.web3.eth.Contract(ERC20Artifact.abi, p.investors[j]).methods
      // const key = contractMap[p.tokens[j].toLowerCase()
      let pool_size = 0;
      if (p.investors[j].toLowerCase() === this.maticInvestor.options.address.toLowerCase()) {
        pool_size = this.web3.utils.fromWei((await this.stakeManager.methods.validators(0).call()).bondedAmount)
      } else if (p.investors[j].toLowerCase() === this.synthetixInvestor.options.address.toLowerCase()) {
        pool_size = this.web3.utils.fromWei(await this.synthetix.methods.balanceOf(this.synthetixInvestor.options.address).call())
      }
      balances.push({
        [contractMap[p.tokens[j].toLowerCase()]]: {
          balance: this.web3.utils.fromWei(await token.balanceOf(await this.getAccount()).call()),
          pool_size
        }
      })
    }
    return balances
  }
}
