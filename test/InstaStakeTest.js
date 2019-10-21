const config = require('../config/default.json')

const InstaStake = artifacts.require('InstaStake')
const Vault = artifacts.require('Vault')
const KyberNetworkProxyInterface = artifacts.require('KyberNetworkProxyInterface')
const Matic = artifacts.require('Matic')
const SNX = artifacts.require('SNX')


contract('InstaStake', async function(accounts) {
  let userWallet = accounts[4];

  describe('createPortfolio and buy', async () => {
    before(async function() {
      this.instaStake = await InstaStake.deployed()
      this.vault = await Vault.deployed()
      this.KNCInstance = await Matic.at(config.contracts.tokens.knc)
      this.maticToken = await Matic.at(config.contracts.tokens.matic)
      this.snxToken = await SNX.at(config.contracts.tokens.snx)
      this.networkProxyInstance = await KyberNetworkProxyInterface.at(config.contracts.kyber.KyberNetworkProxy)
    })

    it('createPortfolio', async function() {
      this.portfolio = await this.instaStake.portfolioId()
      const createPortfolio = await this.instaStake.createPortfolio(
        [this.maticToken.address, this.snxToken.address],
        [50, 50]
      );
      // const createPortfolio = await this.instaStake.createPortfolio(
      //   [this.maticToken.address],
      //   [100]
      // );
      // console.log('createPortfolio', createPortfolio)
    })

    // it('buyDummy', async function() {
    //   console.log('userWallet', userWallet)
    //   console.log('balanceOf userWallet', (await this.KNCInstance.balanceOf(userWallet)).toString())
    //   const amount = web3.utils.toWei(web3.utils.toBN(1))
    //   await this.KNCInstance.approve(this.instaStake.address, amount, {
    //     from: userWallet,
    //   });
    //   console.log('kyberProxy', await this.instaStake.kyberProxy())
    //   console.log('balanceOf Vault', (await this.maticToken.balanceOf(this.vault.address)).toString())
    //   const buyDummy = await this.instaStake.buyDummy(
    //     this.KNCInstance.address,
    //     web3.utils.toWei(web3.utils.toBN(1)),
    //     this.maticToken.address,
    //     { from: userWallet }
    //   )
    //   console.log(buyDummy)
    //   console.log('balanceOf Vault', (await this.maticToken.balanceOf(this.vault.address)).toString())
    // })

    it('buy', async function() {
      console.log('userWallet', userWallet)
      console.log('knc.balanceOf(userWallet)', (await this.KNCInstance.balanceOf(userWallet)).toString())
      const amount = web3.utils.toWei(web3.utils.toBN(2))
      await this.KNCInstance.approve(this.instaStake.address, amount, { from: userWallet });

      console.log('maticToken.balanceOf(Vault)', (await this.maticToken.balanceOf(this.vault.address)).toString())
      console.log('snxToken.balanceOf(Vault)', (await this.snxToken.balanceOf(this.vault.address)).toString())
      const buy = await this.instaStake.buy(
        this.portfolio,
        this.KNCInstance.address,
        amount,
        { from: userWallet }
      );
      // console.log('buy', buy)
      console.log('maticToken.balanceOf(Vault)', (await this.maticToken.balanceOf(this.vault.address)).toString())
      console.log('snxToken.balanceOf(Vault)', (await this.snxToken.balanceOf(this.vault.address)).toString())
    })
  })
})
