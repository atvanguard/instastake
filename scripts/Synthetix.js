const config = require('../config/default.json')
const BN = require('bn.js')

const SynthetixArtifact = require('../build/contracts/ISynthetix.json')
const FeePoolArtifact = require('../build/contracts/IFeePool.json')
const Synth = require('../build/contracts/ISynth.json')

const Web3 = require('web3')

const web3 = new Web3('http://localhost:8545')

// CURRENCIES
const [sUSD, sAUD, sEUR, sBTC, SNX, XDR, iBTC] = [
  'sUSD',
  'sAUD',
  'sEUR',
  'sBTC',
  'SNX',
  'XDR',
  'iBTC',
].map(web3.utils.asciiToHex);
console.log([sUSD, sAUD, sEUR, sBTC, SNX, XDR, iBTC])
const synthetix = new web3.eth.Contract(SynthetixArtifact.abi, config.contracts.synthetix.Synthetix).methods
const feePool = new web3.eth.Contract(FeePoolArtifact.abi, config.contracts.synthetix.FeePool).methods
let XDRContract

const from = '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09'
const owner = '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09'
const oracle = '0x9e8f633D0C46ED7170EF3B30E291c64a91a49C7E'
const account1 = '0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2'

async function execute() {
  console.log('synthetix.balanceOf(from)', await synthetix.balanceOf(from).call())
  const issueSynths = synthetix.issueSynths(sUSD, web3.utils.toWei('10'))
  const gas = await issueSynths.estimateGas({ from });
  const s = await issueSynths.send({ from, gas });

  const length = await feePool.FEE_PERIOD_LENGTH().call()
  // For each fee period (with one extra to test rollover), do two exchange transfers, then close it off.
  for (let i = 0; i <= length; i++) {
    const exchange1 = toUnit(((i + 1) * 10).toString());
    const exchange2 = toUnit(((i + 1) * 15).toString());

    await synthetix.exchange(sUSD, exchange1, sAUD, owner).send({ from: owner, gas: 3000000 });
    await synthetix.exchange(sUSD, exchange2, sAUD, account1).send({ from: account1, gas: 3000000 });

    // await closeFeePeriod();
  }

  // Assert that we have correct values in the fee pool
  // const feesAvailable = await feePool.feesAvailable(owner, XDR).call();
  // XDRContract = new web3.eth.Contract(Synth.abi, await synthetix.synths(XDR)).methods
  // const oldXDRBalance = await XDRContract.balanceOf(owner).call();

  // // Now we should be able to claim them.
  // const claimFeesTx = await feePool.claimFees(XDR).send({ from: owner });
  // assert.eventEqual(claimFeesTx, 'FeesClaimed', {
  //   xdrAmount: feesAvailable[0],
  //   snxRewards: feesAvailable[1],
  // });

  // const newXDRBalance = await XDRContract.balanceOf(owner).call();
  // // We should have our fees
  // assert.bnEqual(newXDRBalance, oldXDRBalance.add(feesAvailable[0]));
}

const toUnit = amount => web3.utils.toWei(amount);
// const toUnit = amount => web3.utils.toBN(web3.utils.toWei(amount.toString(), 'ether'));

const closeFeePeriod = async () => {
  const feePeriodDuration = await feePool.feePeriodDuration().call();
  console.log('feePeriodDuration', feePeriodDuration)
  await fastForward(feePeriodDuration);
  await feePool.closeCurrentFeePeriod().send({ from: account1, gas: 1000000 });
  console.log('here')
  await updateRatesWithDefaults();
};

const fastForward = async seconds => {
	// It's handy to be able to be able to pass big numbers in as we can just
	// query them from the contract, then send them back. If not changed to
	// a number, this causes much larger fast forwards than expected without error.
	if (BN.isBN(seconds)) seconds = seconds.toNumber();

	// And same with strings.
	if (typeof seconds === 'string') seconds = parseFloat(seconds);

	await send({
		method: 'evm_increaseTime',
		params: [seconds],
	});

	await mineBlock();
};

const send = payload => {
	if (!payload.jsonrpc) payload.jsonrpc = '2.0';
	if (!payload.id) payload.id = new Date().getTime();

	return new Promise((resolve, reject) => {
		web3.currentProvider.send(payload, (error, result) => {
			if (error) return reject(error);

			return resolve(result);
		});
	});
};

const mineBlock = () => send({ method: 'evm_mine' });

const updateRatesWithDefaults = async () => {
  const timestamp = await currentTime();

  await exchangeRates.updateRates(
    [sAUD, sEUR, SNX, sBTC, iBTC],
    ['0.5', '1.25', '0.1', '5000', '4000'].map(toUnit),
    timestamp
  ).send(
    {
      from: oracle,
    }
  );
};

const currentTime = async () => {
	const { timestamp } = await web3.eth.getBlock('latest');
	return timestamp;
};

execute().then()
