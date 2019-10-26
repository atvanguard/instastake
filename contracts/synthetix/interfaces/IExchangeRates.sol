pragma solidity ^0.5.11;

/**
 * @title ExchangeRates interface
 */
interface IExchangeRates {
    function effectiveValue(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey) external view returns (uint);

    function rateForCurrency(bytes32 currencyKey) external view returns (uint);
    function ratesForCurrencies(bytes32[] calldata currencyKeys) external view returns (uint[] memory);

    function rateIsStale(bytes32 currencyKey) external view returns (bool);
    function anyRateIsStale(bytes32[] calldata currencyKeys) external view returns (bool);
}
