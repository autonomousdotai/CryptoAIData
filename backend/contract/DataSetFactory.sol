pragma solidity ^0.4.24;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Ownable {
  address public owner;

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
}

contract DataAIToken is Ownable {
  using SafeMath for uint256;

  string public name;
  string public symbol;
  uint256 public decimals = 18;

  uint256 public constant fee = 0.005 ether;

  enum CreatedBy{
    Buyer,
    Provider
  }

  struct DataSet {
    bool created;
    uint256 requestGoal;
    uint256 currentQuanlity;
    CreatedBy createdBy;
    address[] providers;
    mapping (address => uint256) mappedProviders;
  }

  mapping (bytes => DataSet) dataSets;

  event Transfers(address to, uint256 tokens, uint256 amount);

  constructor(string tokenName, string tokenSymbol) payable public {
    name = tokenName;
    symbol = tokenSymbol;
  }

  function buy(bytes data) external payable {
    // if (!dataSetExists(msg.data)) {
    //   revert();
    // }
    // if (!dataSetExists(data)) {
    //   revert();
    // }

    DataSet storage ds = dataSets[data];
    uint length = ds.providers.length;
    uint256 total;
    for (uint i = 0; i < length; i++) {
      total += ds.mappedProviders[ds.providers[i]];
    }

    for (i = 0; i < length; i++) {
      address p = ds.providers[i];
      uint256 tokens = ds.mappedProviders[p];
      uint256 amount = tokens.mul(msg.value).div(total).sub(fee);
      p.transfer(amount);

      emit Transfers(p, tokens, amount);
    }
  }

  function dataSetExists(bytes ds) onlyOwner public view returns (bool) {
    if (dataSets[ds].created) {
        return true;
    }
    return false;
  }

  function addDataSet(bytes ds, uint8 createdBy, uint256 requestGoal) onlyOwner public returns (bool) {
    if (dataSetExists(ds)) {
        return false;
    }
    dataSets[ds] = DataSet(true, requestGoal, 0, CreatedBy(createdBy), new address[](0));
    return true;
  }

  function getProviders(bytes ds) onlyOwner public view returns (address[]) {
    return dataSets[ds].providers;
  }

  function addProvider(bytes ds, address provider, uint256 amount) onlyOwner public returns (uint) {
    require(provider != address(0));
    require(dataSetExists(ds));

    if (dataSets[ds].mappedProviders[provider] == 0) {
      dataSets[ds].providers.push(provider);
    }

    dataSets[ds].mappedProviders[provider] += amount;
    return dataSets[ds].mappedProviders[provider];
  }
}
