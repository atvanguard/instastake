import React, { createContext, useEffect, useState } from 'react';

import Web3Client from './Web3Client'

export const AppContext = createContext({
  currentAccount: null,
  handleSetInvestorPreferences: () => { /* default does nothing */ },
  isOnboarding: true,
  preferences: {
    timeframe: undefined, // 0: short, 1: medium, 2: long
    risk: undefined // 0: conservative, 1: balanced, 2: aggressive
  },
  web3: null
})

export const AppContextConsumer = AppContext.Consumer;

export const AppContextProvider = (props) => {
  const { children } = props;
  
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      let _web3 = new Web3Client()
      await _web3.initialize()
      setWeb3(_web3);
    }

    initializeWeb3();
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      if (web3) {
        const account = await web3.getAccount();
        console.log('current account -> ', account);
        setCurrentAccount(account);
        checkIfOnboarding(account);
      }
    }

    fetchAccount();
  }, [web3]);

  const checkIfOnboarding = (account) => {
    const key = `preferences:${account}`;

    try {
      const localPrefs = JSON.parse(localStorage.getItem(key));
      if (localPrefs) {
        setPreferences(localPrefs);
        setIsOnboarding(false);
      } else {
        setIsOnboarding(true);
      }
    } catch (e) {
      setIsOnboarding(true);
    }
  }

  const handleSetInvestorPreferences = (preferences) => {
    // FIXME: this type of stuff can be persisted in a regular db but for hackathon just in localstorage
    if (preferences && currentAccount) {
      localStorage.setItem(`preferences:${currentAccount}`, JSON.stringify(preferences));
    }
    const pref = JSON.parse(localStorage.getItem(`preferences:${currentAccount}`));

    setPreferences(pref);
  }

  return (
    <AppContext.Provider value={{
      currentAccount,
      handleSetInvestorPreferences,
      isOnboarding,
      preferences,
      web3
    }}>
      { children }
    </AppContext.Provider>
  )
}
