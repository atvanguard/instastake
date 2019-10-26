- Run ganache (Contains Kyber and synthetix contracts)
```
ganache-cli --db db --accounts 10 --defaultBalanceEther 1000000000000 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 -l 0x7a1200 -t 2018-03-13T00:00:00
```

- Run test
```
npm run compile
npm test
```

- Run UI ( in another terminal )
```
cd ui
yarn
yarn start
```