pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract DatasetToken is MintableToken {
  string public name;
  string public symbol;
  uint8 public decimals;

  address public owner;

  constructor(address _owner, string _name, string _symbol, uint8 _decimals) public {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;

    owner = _owner;
  }
}
