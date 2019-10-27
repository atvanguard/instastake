const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const config = require('../config/default.json')

// const StakeManager = artifacts.require('StakeManager')
// const InstaStake = artifacts.require('InstaStake')
// const MaticInvestor = artifacts.require('MaticInvestor');

const InstaStake = require('../build/contracts/InstaStake.json')
const MaticInvestor = require('../build/contracts/MaticInvestor.json')
const SynthetixInvestor = require('../build/contracts/SynthetixInvestor.json')

// async function execute() {
//   const networkId = await web3.eth.net.getId();
//   console.log('networkId', networkId)
//   const instaStake = new web3.eth.Contract(
//     InstaStake.abi,
//     InstaStake.networks[networkId].address
//   ).methods;
//   const p = await instaStake.createPortfolio(
//     [config.contracts.tokens.omg], // this.maticToken.address
//     [MaticInvestor.networks[networkId].address],
//     [100]
//   ).send({ from: '0x2B522cABE9950D1153c26C1b399B293CaA99FcF9', gas: 1000000 })
//   console.log(p)
// }

async function execute() {
  const networkId = await web3.eth.net.getId();
  console.log('networkId', networkId)
  const instaStake = new web3.eth.Contract(
    InstaStake.abi,
    InstaStake.networks[networkId].address
  ).methods;
  let p = await instaStake.createPortfolio(
    // matic, snx
    [config.contracts.tokens.omg, config.contracts.synthetix.Synthetix],
    [
      MaticInvestor.networks[networkId].address,
      SynthetixInvestor.networks[networkId].address
    ],
    [70, 30]
  ).send({ from: '0x2B522cABE9950D1153c26C1b399B293CaA99FcF9', gas: 1000000 })
  console.log(p)

  // create 2nd portfolio
  p = await instaStake.createPortfolio(
    [config.contracts.tokens.omg], // matic
    [MaticInvestor.networks[networkId].address],
    [100]
  ).send({ from: '0x2B522cABE9950D1153c26C1b399B293CaA99FcF9', gas: 1000000 })
}

execute().then()

// async function execute() {
//   const instaStake = await InstaStake.deployed()
//   const maticInvestor = await MaticInvestor.deployed()
//   console.log(instaStake.address, maticInvestor.address)
//   const p = await instaStake.createPortfolio(
//     [config.contracts.tokens.omg], // this.maticToken.address
//     [maticInvestor.address],
//     [100]
//   )
//   console.log(p)
//   console.log('here')
// }

// module.exports = async callback => {
//   await execute()
//   callback()
// }
