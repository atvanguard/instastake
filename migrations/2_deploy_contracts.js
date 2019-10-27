const config = require('../config/default.json')

const InstaStake = artifacts.require("InstaStake");

module.exports = async function(deployer) {
  await deployer.deploy(InstaStake, config.contracts.kyber.KyberNetworkProxy);
};
