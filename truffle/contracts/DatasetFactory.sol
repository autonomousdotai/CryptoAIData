pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Dataset.sol';

contract DatasetFactory is Ownable {

  address[] public datasets;

  function createDataset(address owner, string name, string symbol, uint8 decimals, uint256 requestGoal) onlyOwner public returns (address) {
    address ds = new Dataset(owner, name, symbol, decimals, requestGoal);
    datasets.push(ds);

    return ds;
  }

  function getDatasets() public view returns (address[]) {
    return datasets;
  }
}
