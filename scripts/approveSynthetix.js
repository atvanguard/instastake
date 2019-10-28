const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const config = require('../config/default.json')

const InstaStake = require('../build/contracts/InstaStake.json')
const Synthetix = require('../build/contracts/ISynthetix.json')
const IErc20 = require('../build/contracts/IERC20.json')

let networkId
const SCALING_FACTOR = web3.utils.toBN(10).pow(web3.utils.toBN(18))

const accounts = ['0x2B522cABE9950D1153c26C1b399B293CaA99FcF9']
let userWallet = '0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2' // has knc

async function execute() {
  networkId = await web3.eth.net.getId();
  console.log('network Id', networkId)

  const buyAmount = getAmount(10)
  const KNCInstance = getContract(IErc20, config.contracts.tokens.knc)
  const synthetix = getContract(IErc20, config.contracts.synthetix.Synthetix)
  const instaStake = getContract(InstaStake)
  await synthetix.methods.approve(instaStake.options.address, buyAmount).send({ from: userWallet, gas: 1000000 });
  await KNCInstance.methods.approve(instaStake.options.address, buyAmount).send({ from: userWallet, gas: 1000000 });
  console.log(
    web3.utils.fromWei(await synthetix.methods.balanceOf(userWallet).call()),
    web3.utils.fromWei(await synthetix.methods.allowance(userWallet, instaStake.options.address).call()),
    web3.utils.fromWei(await KNCInstance.methods.balanceOf(userWallet).call()),
    web3.utils.fromWei(await KNCInstance.methods.allowance(userWallet, instaStake.options.address).call())
  )
  // console.log(await instaStake.methods.buy(0, KNCInstance.options.address, buyAmount).send({ from: userWallet, gas: 1000000 }))
}

execute().then()

function getContract(artifact, address) {
  address = address || artifact.networks[networkId].address
  return new web3.eth.Contract(artifact.abi, address)
}

function getAmount(amount) {
  return '0x' + web3.utils.toBN(amount).mul(SCALING_FACTOR).toString('hex')
}
