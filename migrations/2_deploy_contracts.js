// const config = require(`../config/${process.env.NODE_ENV}.json`)
const config = require(`../config/default.json`)

const InstaStake = artifacts.require("InstaStake");
const StakeManager = artifacts.require("StakeManager");
const MaticInvestor = artifacts.require("MaticInvestor");
const SynthetixInvestor = artifacts.require("SynthetixInvestor");

module.exports = async function(deployer) {
  await deployer.deploy(StakeManager, config.contracts.tokens.omg);
  await deployer.deploy(MaticInvestor, StakeManager.address, config.contracts.tokens.omg);
  await deployer.deploy(SynthetixInvestor, config.contracts.synthetix.Synthetix);

  await deployer.deploy(InstaStake, config.contracts.kyber.KyberNetworkProxy);

  console.log({
    StakeManager: StakeManager.address,
    MaticInvestor: MaticInvestor.address,
    SynthetixInvestor: SynthetixInvestor.address,
    InstaStake: InstaStake.address,
  })
};
