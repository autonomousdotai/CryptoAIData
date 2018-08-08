pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Dataset.sol';
import './DatasetToken.sol';

contract DatasetFactory is Ownable {

  address[] public datasets;

  event DatasetCreated(address indexed ds);

  function createDataset(address owner, string name, string symbol, uint8 decimals, uint256 requestGoal) onlyOwner external {
    DatasetToken token = createToken(name, symbol, decimals);

    address ds = new Dataset(owner, token, requestGoal);
    token.transferOwnership(ds);

    datasets.push(ds);

    emit DatasetCreated(ds);
  }

  function createToken(string name, string symbol, uint8 decimals) internal returns (DatasetToken) {
    return new DatasetToken(name, symbol, decimals);
  }

  function getDatasets() public view returns (address[]) {
    return datasets;
  }
}
