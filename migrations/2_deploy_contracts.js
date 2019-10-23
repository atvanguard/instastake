const config = require('../config/default.json')

const Vault = artifacts.require("Vault");
const InstaStake = artifacts.require("InstaStake");

module.exports = async function(deployer) {
  await deployer.deploy(Vault);
  await deployer.deploy(InstaStake, config.contracts.kyber.KyberNetworkProxy);
};
