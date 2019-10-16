pragma solidity ^0.5.11;

contract ISynthetix {
  function issueSynths(bytes32 currencyKey, uint amount) public;
}