const BN = require('bn.js');

const config = require('../config/default.json')

const InstaStake = artifacts.require('InstaStake')

// Matic contracts
const MaticInvestor = artifacts.require('MaticInvestor')
const StakeManager = artifacts.require('StakeManager')

const KyberNetworkProxyInterface = artifacts.require('KyberNetworkProxyInterface')
const Matic = artifacts.require('Matic')

contract('InstaStake', async function(accounts) {
  let userWallet = accounts[4];

  before(async function() {
    this.instaStake = await InstaStake.deployed()
    this.KNCInstance = await Matic.at(config.contracts.tokens.knc)
    this.maticToken = await Matic.at(config.contracts.tokens.omg)
    this.networkProxyInstance = await KyberNetworkProxyInterface.at(config.contracts.kyber.KyberNetworkProxy)
  })

  it('createPortfolio', async function() {
    console.log('InstaStake.address', this.instaStake.address)
    this.stakeManager = await StakeManager.new(this.maticToken.address)
    this.maticInvestor = await MaticInvestor.new(this.stakeManager.address, this.maticToken.address)
    this.portfolio = await this.instaStake.portfolioId()
    const createPortfolio = await this.instaStake.createPortfolio(
      [this.maticToken.address],
      [this.maticInvestor.address],
      [100]
    );
    // console.log('createPortfolio', createPortfolio)
  })

  it('become matic validator', async function() {
    // swap KNC for matic tokens
    const staker = accounts[0];
    const srcQty = web3.utils.toWei(new BN(100))
    const stakeAmount = web3.utils.toWei(web3.utils.toBN(1))
    const { expectedRate, slippageRate } = await this.networkProxyInstance.getExpectedRate(
      this.KNCInstance.address, // srcToken
      this.maticToken.address, // destToken
      srcQty
    );
    console.log('expectedRate', expectedRate.toString())
    await this.KNCInstance.approve(this.networkProxyInstance.address, srcQty, { from: userWallet });
    await this.networkProxyInstance.swapTokenToToken(
      this.KNCInstance.address,
      srcQty,
      this.maticToken.address,
      expectedRate,
      { from: userWallet }
    )
    await this.maticToken.transfer(staker, stakeAmount, { from: userWallet })
    await this.maticToken.approve(this.stakeManager.address, stakeAmount, { from: staker })
    this.validatorId = await this.stakeManager.validatorID();
    await this.stakeManager.stake(stakeAmount, { from: staker })

    await this.maticInvestor.whitelistValidator(this.validatorId);
  })

  it('buy', async function() {
    console.log('userWallet', userWallet)
    console.log('knc.balanceOf(userWallet)', (await this.KNCInstance.balanceOf(userWallet)).toString())
    const amount = web3.utils.toWei(web3.utils.toBN(2))
    await this.KNCInstance.approve(this.instaStake.address, amount, { from: userWallet });

    console.log('maticInvestor.balanceOf(userWallet)', (await this.maticInvestor.balanceOf(userWallet)).toString())
    console.log('matic.balanceOf(maticInvestor)', (await this.maticToken.balanceOf(this.maticInvestor.address)).toString())
    const buy = await this.instaStake.buy(
      this.portfolio,
      [this.KNCInstance.address],
      amount,
      { from: userWallet }
    );
    console.log('bought into portfolio')
    console.log('maticInvestor.balanceOf(userWallet)', (await this.maticInvestor.balanceOf(userWallet)).toString())
    console.log('matic.balanceOf(maticInvestor)', (await this.maticToken.balanceOf(this.maticInvestor.address)).toString())
    const investedPoolSize = await this.stakeManager.totalDelegated()
    console.log('matic token invested pool size', investedPoolSize.toString())
    console.log('matic token investor ROI',
      investedPoolSize.div(await this.maticInvestor.balanceOf(userWallet)).toString()
    )
  })

  it('rewardValidator', async function() {
    const reward = web3.utils.toWei(web3.utils.toBN(10))
    await this.maticToken.approve(this.stakeManager.address, reward, { from: userWallet });
    await this.stakeManager.rewardValidator(this.validatorId, reward, { from: userWallet })
    await this.stakeManager.distributeRewards(this.validatorId);
    const investedPoolSize = await this.stakeManager.totalDelegated()
    console.log('matic token invested pool size', investedPoolSize.toString())
    console.log('matic token investor ROI',
      investedPoolSize.div(await this.maticInvestor.balanceOf(userWallet)).toString()
    )
  })
})
