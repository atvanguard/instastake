const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const config = require('../config/default.json')

const BN = require('bn.js')

const InstaStake = require('../build/contracts/InstaStake.json')
const MaticInvestor = require('../build/contracts/MaticInvestor.json')
const SynthetixInvestor = require('../build/contracts/SynthetixInvestor.json')
const Synthetix = require('../build/contracts/ISynthetix.json')
const StakeManager = require('../build/contracts/StakeManager.json')
const KyberNetworkProxyInterface = require('../build/contracts/KyberNetworkProxyInterface.json')
const IErc20 = require('../build/contracts/IERC20.json')

let networkId

const accounts = ['0x2B522cABE9950D1153c26C1b399B293CaA99FcF9']
let userWallet = '0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2' // has knc

const SCALING_FACTOR = web3.utils.toBN(10).pow(web3.utils.toBN(18))

async function execute() {
  networkId = await web3.eth.net.getId();
  console.log('network Id', networkId)
  const KNCInstance = getContract(IErc20, config.contracts.tokens.knc)

  const stakeManager = getContract(StakeManager)
  const maticToken = getContract(IErc20, config.contracts.tokens.omg)
  const maticInvestor = getContract(MaticInvestor)

  const synthetix = getContract(IErc20, config.contracts.synthetix.Synthetix)
  const synthetixInvestor = getContract(SynthetixInvestor)

  const networkProxyInstance = getContract(KyberNetworkProxyInterface, config.contracts.kyber.KyberNetworkProxy)
  const instaStake = getContract(InstaStake)

  // A. Create portfolio
  let p = await instaStake.methods.createPortfolio(
    [
      synthetix.options.address,
      maticToken.options.address
    ],
    [
      synthetixInvestor.options.address,
      maticInvestor.options.address
    ],
    // [100, 0]
    [70, 30]
  ).send({ from: accounts[0], gas: 1000000 })
  console.log(p)

  // let p = await instaStake.methods.createPortfolio(
  //   [
  //     synthetix.options.address
  //   ],
  //   [
  //     synthetixInvestor.options.address
  //   ],
  //   [100]
  // ).send({ from: accounts[0], gas: 1000000 })
  // console.log(p)

  // B. become matic validator
  // swap KNC for matic tokens
  const staker = userWallet;
  const srcQty = getAmount(100)
  const stakeAmount = getAmount(1)
  // await KNCInstance.methods.transfer(staker, stakeAmount).send({ from: userWallet, gas: 1000000})
  console.log('KNCInstance.balanceOf(userWallet)', await KNCInstance.methods.balanceOf(userWallet).call())
  // console.log('KNCInstance.balanceOf(staker)', web3.utils.fromWei(await KNCInstance.methods.balanceOf(staker).call()))
  const { expectedRate } = await networkProxyInstance.methods.getExpectedRate(
    KNCInstance.options.address, // srcToken
    maticToken.options.address, // destToken
    srcQty
  ).call();
  console.log('expectedRate', expectedRate)
  await KNCInstance.methods.approve(networkProxyInstance.options.address, srcQty).send({ from: userWallet, gas: 1000000 })
  await networkProxyInstance.methods.swapTokenToToken(
    KNCInstance.options.address,
    srcQty,
    maticToken.options.address,
    expectedRate
  ).send({ from: userWallet, gas: 1000000 })
  console.log('swapped')
  await maticToken.methods.transfer(staker, stakeAmount).send({ from: userWallet, gas: 1000000})
  await maticToken.methods.approve(stakeManager.options.address, stakeAmount).send({ from: staker, gas: 1000000 })
  const validatorId = await stakeManager.methods.validatorID().call();
  console.log('validatorId', validatorId)
  console.log('maticToken.balanceOf(userWallet)', web3.utils.fromWei(await maticToken.methods.balanceOf(userWallet).call()))
  await stakeManager.methods.stake(stakeAmount).send({ from: staker, gas: 1000000 })
  console.log('staked')
  await maticInvestor.methods.whitelistValidator(validatorId).send({ from: userWallet, gas: 1000000 });
  console.log('whitelisted validator')

  // Buy
  // const buyAmount = getAmount(10)
  // await synthetix.methods.transfer(userWallet, buyAmount).send({ from: '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09', gas: 1000000})
  // console.log('KNCInstance.balanceOf(userWallet)', web3.utils.fromWei(await KNCInstance.methods.balanceOf(userWallet).call()))
  // // console.log('synthetix.balanceOf(userWallet)', web3.utils.fromWei(await synthetix.methods.balanceOf(userWallet).call()))
  // await synthetix.methods.approve(instaStake.options.address, buyAmount).send({ from: userWallet, gas: 1000000 });
  // await KNCInstance.methods.approve(instaStake.options.address, buyAmount).send({ from: userWallet, gas: 1000000 });
  // await instaStake.methods.buy(0, KNCInstance.options.address, buyAmount).send({ from: userWallet, gas: 1000000 });
  // // console.log(await instaStake.methods.buy2(0, KNCInstance.options.address, buyAmount).call({ from: userWallet }))
  // console.log('synthetix.balanceOf(synthetixInvestor)', web3.utils.fromWei(await synthetix.methods.balanceOf(synthetixInvestor.options.address).call()))
  // console.log('synthetixInvestor.balanceOf(userWallet)', web3.utils.fromWei(await synthetixInvestor.methods.balanceOf(userWallet).call()))
  // console.log('maticToken.balanceOf(stakeManager)', web3.utils.fromWei(await maticToken.methods.balanceOf(stakeManager.options.address).call()))
  // console.log('maticInvestor.balanceOf(userWallet)', web3.utils.fromWei(await maticInvestor.methods.balanceOf(userWallet).call()))
}

execute().then()

function getContract(artifact, address) {
  address = address || artifact.networks[networkId].address
  return new web3.eth.Contract(artifact.abi, address)
}

function getAmount(amount) {
  return '0x' + web3.utils.toBN(amount).mul(SCALING_FACTOR).toString('hex')
}
