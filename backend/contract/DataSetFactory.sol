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

contract DatasetAI is Ownable {
  using SafeMath for uint256;

  string public name;
  string public symbol;
  uint256 public decimals = 18;

  uint256 public constant fee = 0.005 ether;

  enum CreatedBy{
    Buyer,
    Provider
  }

  struct Dataset {
    bool created;
    uint256 requestGoal;
    uint256 currentQuanlity;
    CreatedBy createdBy;
    address[] providers;
    mapping (address => uint256) mappedProviders;
  }

  mapping (bytes => Dataset) datasets;

  event Transfers(address to, uint256 tokens, uint256 amount);

  constructor(string tokenName, string tokenSymbol) payable public {
    name = tokenName;
    symbol = tokenSymbol;
  }

  function buy(bytes data) external payable {
    // if (!datasetExists(data)) {
    //   revert();
    // }

    Dataset storage ds = datasets[data];
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

  function datasetExists(bytes ds) onlyOwner public view returns (bool) {
    if (datasets[ds].created) {
        return true;
    }
    return false;
  }

  function addDataset(bytes ds, uint8 createdBy, uint256 requestGoal) onlyOwner public returns (bool) {
    if (datasetExists(ds)) {
        return false;
    }
    datasets[ds] = Dataset(true, requestGoal, 0, CreatedBy(createdBy), new address[](0));
    return true;
  }

  function getProviders(bytes ds) onlyOwner public view returns (address[]) {
    return datasets[ds].providers;
  }

  function addProvider(bytes ds, address provider, uint256 amount) onlyOwner public returns (uint) {
    require(provider != address(0));
    require(datasetExists(ds));

    if (datasets[ds].mappedProviders[provider] == 0) {
      datasets[ds].providers.push(provider);
    }

    datasets[ds].mappedProviders[provider] += amount;
    return datasets[ds].mappedProviders[provider];
  }
}
