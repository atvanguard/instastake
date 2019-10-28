const Web3 = require('web3')
// const web3 = new Web3('http://localhost:8545')
// const config = require('../config/default.json')

const HDWalletProvider = require('truffle-hdwallet-provider');
const web3 = new Web3(new HDWalletProvider(process.env.mnemonic, `https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`))
const config = require('../config/ropsten.json')

const BN = require('bn.js')

const InstaStake = require('../build/contracts/InstaStake.json')
const MaticInvestor = require('../build/contracts/MaticInvestor.json')
const SynthetixInvestor = require('../build/contracts/SynthetixInvestor.json')
const Synthetix = require('../build/contracts/ISynthetix.json')
const StakeManager = require('../build/contracts/StakeManager.json')
const KyberNetworkProxyInterface = require('../build/contracts/KyberNetworkProxyInterface.json')
const IErc20 = require('../build/contracts/IERC20.json')

let networkId

// const accounts = ['0x2B522cABE9950D1153c26C1b399B293CaA99FcF9']
// let userWallet = '0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2' // has knc

const accounts = ['0x5D8BC2b47634dB18F3Be8A30b4Dd5F66F97Ae057']
let userWallet = '0x5D8BC2b47634dB18F3Be8A30b4Dd5F66F97Ae057' // has dai/knc


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
  // let p = await instaStake.methods.createPortfolio(
  //   [
  //     synthetix.options.address,
  //   ],
  //   [
  //     synthetixInvestor.options.address,
  //   ],
  //   [100]
  // ).send({ from: accounts[0], gas: 1000000, gasPrice: '10000000000' })
  // console.log(p)

  const buyAmount = getAmount(10)
  console.log('KNCInstance.balanceOf(userWallet)', web3.utils.fromWei(await KNCInstance.methods.balanceOf(userWallet).call()))
  console.log('synthetix.balanceOf(userWallet)', web3.utils.fromWei(await synthetix.methods.balanceOf(userWallet).call()))
  // await KNCInstance.methods.approve(instaStake.options.address, buyAmount)
  //   .send({ from: userWallet, gas: 1000000, gasPrice: '10000000000' })
  await instaStake.methods.buy(0, KNCInstance.options.address, buyAmount)
    .send({ from: userWallet, gas: 1000000, gasPrice: '10000000000' })
  console.log('synthetix.balanceOf(synthetixInvestor)', web3.utils.fromWei(await synthetix.methods.balanceOf(synthetixInvestor.options.address).call()))
  console.log('synthetixInvestor.balanceOf(userWallet)', web3.utils.fromWei(await synthetixInvestor.methods.balanceOf(userWallet).call()))
}

execute().then()

function getContract(artifact, address) {
  address = address || artifact.networks[networkId].address
  return new web3.eth.Contract(artifact.abi, address)
}

function getAmount(amount) {
  return '0x' + web3.utils.toBN(amount).mul(SCALING_FACTOR).toString('hex')
}
