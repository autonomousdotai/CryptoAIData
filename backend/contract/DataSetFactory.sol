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
    address[] requesters;

    mapping (address => uint256) mappedProviders;
    mapping (address => uint256) mappedRequesters;
  }

  mapping (uint32 => Dataset) datasets;

  event Transfer(address to, uint256 balance, uint256 total, uint256 amount, uint256 totalAmount);
  event Refund(address requester, uint256 amount);

  constructor(string tokenName, string tokenSymbol) payable public {
    name = tokenName;
    symbol = tokenSymbol;
  }

  function datasetExists(uint32 dsId) public view returns (bool) {
    if (datasets[dsId].created) {
        return true;
    }
    return false;
  }

  function addDataset(uint32 dsId, uint8 createdBy, uint256 requestGoal) onlyOwner public returns (bool) {
    if (datasetExists(dsId)) {
        return false;
    }
    datasets[dsId] = Dataset(true, requestGoal, 0, CreatedBy(createdBy), new address[](0), new address[](0));
    return true;
  }

  function addProvider(uint32 dsId, address provider, uint256 amount) onlyOwner public returns (uint) {
    require(provider != address(0));
    require(datasetExists(dsId));

    if (datasets[dsId].mappedProviders[provider] == 0) {
      datasets[dsId].providers.push(provider);
    }

    datasets[dsId].mappedProviders[provider] += amount;
    return datasets[dsId].mappedProviders[provider];
  }

  function getProviders(uint32 dsId) public view returns (address[]) {
    require(datasetExists(dsId));

    return datasets[dsId].providers;
  }

  function getProvider(uint32 dsId, address provider) public view returns (uint256) {
    require(datasetExists(dsId));
    require(provider != address(0));

    return datasets[dsId].mappedProviders[provider];
  }

  function getRequesters(uint32 dsId) public view returns (address[]) {
    require(datasetExists(dsId));

    return datasets[dsId].requesters;
  }

  function getRequester(uint32 dsId, address requester) public view returns (uint256) {
    require(datasetExists(dsId));
    require(requester != address(0));

    return datasets[dsId].mappedRequesters[requester];
  }

  function buy(uint32 dsId) external payable {
    if (!datasetExists(dsId)) {
      revert();
    }

    Dataset storage ds = datasets[dsId];
    uint length = ds.providers.length;
    uint256 total;
    for (uint i = 0; i < length; i++) {
      total = total.add(ds.mappedProviders[ds.providers[i]]);
    }

    for (i = 0; i < length; i++) {
      address p = ds.providers[i];
      uint256 balance = ds.mappedProviders[p];
      uint256 amount = balance.mul(msg.value).div(total).sub(fee);
      p.transfer(amount);

      emit Transfer(p, balance, total, amount, msg.value);
    }
  }

  function request(uint32 dsId) external payable returns (uint256) {
    if (!datasetExists(dsId)) {
      revert();
    }

    Dataset storage ds = datasets[dsId];
    if (ds.mappedRequesters[msg.sender] == 0) {
      ds.requesters.push(msg.sender);
    }

    ds.mappedRequesters[msg.sender] += msg.value;
    return ds.mappedRequesters[msg.sender];
  }

  function paid(uint32 dsId, address requester) onlyOwner public {
    require(datasetExists(dsId));
    require(requester != address(0));

    Dataset storage ds = datasets[dsId];

    uint256 requestedAmount = ds.mappedRequesters[requester];
    require(requestedAmount > fee);

    uint length = ds.providers.length;
    uint256 total;
    for (uint i = 0; i < length; i++) {
      total = total.add(ds.mappedProviders[ds.providers[i]]);
    }

    for (i = 0; i < length; i++) {
      address p = ds.providers[i];
      uint256 balance = ds.mappedProviders[p];
      uint256 amount = balance.mul(requestedAmount).div(total).sub(fee);
      p.transfer(amount);

      emit Transfer(p, balance, total, amount, requestedAmount);
    }

    ds.mappedRequester[requester] = 0;
  }

  function refund(uint32 dsId, address requester) onlyOwner public {
    require(datasetExists(dsId));
    require(requester != address(0));

    Dataset storage ds = datasets[dsId];
    uint256 requestedAmount = ds.mappedRequesters[requester];
    require(requestedAmount > fee);

    requester.transfer(requestedAmount.sub(fee));

    emit Refund(requester, requestedAmount);
  }
}
