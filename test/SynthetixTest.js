const BN = require('bn.js');

const config = require('../config/default.json')

const InstaStake = artifacts.require('InstaStake')

// Matic contracts
const SynthetixInvestor = artifacts.require('SynthetixInvestor')
const ISynthetix = artifacts.require('ISynthetix')
const IERC20 = artifacts.require('IERC20')

const KyberNetworkProxyInterface = artifacts.require('KyberNetworkProxyInterface')

contract('InstaStake - Synthetix', async function(accounts) {
  let userWallet = '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09' // has synthetix

  before(async function() {
    this.instaStake = await InstaStake.deployed()
    this.synthetix = await ISynthetix.at(config.contracts.synthetix.Synthetix)
    console.log(await this.synthetix.synths('0x7355534400000000000000000000000000000000000000000000000000000000'))
    this.KNCInstance = await IERC20.at(config.contracts.tokens.knc)
    this.networkProxyInstance = await KyberNetworkProxyInterface.at(config.contracts.kyber.KyberNetworkProxy)
  })

  it('createPortfolio', async function() {
    this.synthetixInvestor = await SynthetixInvestor.new(this.synthetix.address)
    this.portfolio = await this.instaStake.portfolioId()
    const createPortfolio = await this.instaStake.createPortfolio(
      [this.synthetix.address],
      [this.synthetixInvestor.address],
      [100]
    );
    // console.log('createPortfolio', createPortfolio)
  })

  it('buy', async function() {
    console.log('userWallet', userWallet)

    console.log('synthetix.balanceOf(userWallet)', (await this.synthetix.balanceOf(userWallet)).toString())
    console.log('synthetix.balanceOf(synthetixInvestor)', (await this.synthetix.balanceOf(this.synthetixInvestor.address)).toString())
    console.log('synthetixInvestor.balanceOf(userWallet)', (await this.synthetixInvestor.balanceOf(userWallet)).toString())

    const amount = web3.utils.toWei(web3.utils.toBN(5))
    await this.synthetix.approve(this.instaStake.address, amount, { from: userWallet })
    const buy = await this.instaStake.buy(
      this.portfolio,
      [this.synthetix.address],
      // this.KNCInstance.address,
      amount,
      { from: userWallet }
    );

    console.log('synthetix.balanceOf(userWallet)', (await this.synthetix.balanceOf(userWallet)).toString())
    console.log('synthetix.balanceOf(synthetixInvestor)', (await this.synthetix.balanceOf(this.synthetixInvestor.address)).toString())
    console.log('synthetixInvestor.balanceOf(userWallet)', (await this.synthetixInvestor.balanceOf(userWallet)).toString())
  })
})
