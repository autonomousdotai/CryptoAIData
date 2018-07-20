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

  uint256 contractBalance;

  uint256 public constant transferFee = 0.005 ether;

  enum CreatedBy{
    Buyer,
    Provider
  }

  struct Dataset {
    bool created;
    uint256 requestGoal;
    uint256 currentQuantity;
    CreatedBy createdBy;

    address[] providers;
    address[] requesters;

    mapping (address => uint256) mappedProviders;
    mapping (address => uint256) mappedRequesters;
  }

  mapping (uint32 => Dataset) datasets;
  mapping (address => uint256) withdrawableBalances;

  modifier datasetExists(uint32 dsId) {
    require(datasets[dsId].created);
    _;
  }

  constructor(string tokenName, string tokenSymbol) payable public {
    name = tokenName;
    symbol = tokenSymbol;
  }

  function addDataset(uint32 dsId, uint8 createdBy, uint256 requestGoal) onlyOwner external {
    datasets[dsId] = Dataset(true, requestGoal, 0, CreatedBy(createdBy), new address[](0), new address[](0));
  }

  function addProvider(uint32 dsId, address provider, uint256 amount) onlyOwner datasetExists(dsId) public returns (uint) {
    require(provider != address(0));

    Dataset storage ds = datasets[dsId];
    if (ds.mappedProviders[provider] == 0) {
      ds.providers.push(provider);
    }

    ds.currentQuantity += amount;
    ds.mappedProviders[provider] += amount;

    if (ds.createdBy == CreatedBy.Buyer && ds.currentQuantity >= ds.requestGoal) {
      ds.createdBy = CreatedBy.Provider;
      reachGoal(dsId, ds.requesters[0]);
    }

    return ds.mappedProviders[provider];
  }

  function getProviders(uint32 dsId) datasetExists(dsId) public view returns (address[]) {
    return datasets[dsId].providers;
  }

  function getProvider(uint32 dsId, address provider) datasetExists(dsId) public view returns (uint256) {
    require(provider != address(0));

    return datasets[dsId].mappedProviders[provider];
  }

  function getRequesters(uint32 dsId) datasetExists(dsId) public view returns (address[]) {
    return datasets[dsId].requesters;
  }

  function getRequester(uint32 dsId, address requester) datasetExists(dsId) public view returns (uint256) {
    require(requester != address(0));

    return datasets[dsId].mappedRequesters[requester];
  }

  function buy(uint32 dsId) datasetExists(dsId) external payable {
    Dataset storage ds = datasets[dsId];
    uint length = ds.providers.length;
    uint256 total;
    for (uint i = 0; i < length; i++) {
      total = total.add(ds.mappedProviders[ds.providers[i]]);
    }

    uint256 fee = msg.value.mul(10).div(100);
    contractBalance += fee;

    uint256 remainAmount = msg.value.sub(fee);

    for (i = 0; i < length; i++) {
      address p = ds.providers[i];
      uint256 amount = ds.mappedProviders[p];
      uint256 balance = amount.mul(remainAmount).div(total);

      withdrawableBalances[p] += balance;
    }

    uint256 buyerBalance = total.mul(5).div(100);
    if (buyerBalance > transferFee) {
      addProvider(dsId, msg.sender, buyerBalance);
    }
  }

  function request(uint32 dsId) datasetExists(dsId) external payable returns (uint256) {
    Dataset storage ds = datasets[dsId];
    require(ds.currentQuantity < ds.requestGoal);

    if (ds.mappedRequesters[msg.sender] == 0) {
      ds.requesters.push(msg.sender);
    }

    ds.createdBy = CreatedBy.Buyer;
    ds.mappedRequesters[msg.sender] += msg.value;
    return ds.mappedRequesters[msg.sender];
  }

  function reachGoal(uint32 dsId, address requester) internal {
    require(requester != address(0));

    Dataset storage ds = datasets[dsId];

    uint256 requestedAmount = ds.mappedRequesters[requester];
    require(requestedAmount > transferFee);

    uint length = ds.providers.length;
    uint256 total;
    for (uint i = 0; i < length; i++) {
      total = total.add(ds.mappedProviders[ds.providers[i]]);
    }

    for (i = 0; i < length; i++) {
      address p = ds.providers[i];
      uint256 amount = ds.mappedProviders[p];
      uint256 balance = amount.mul(requestedAmount).div(total);

      withdrawableBalances[p] += balance;
    }

    ds.mappedRequesters[requester] = 0;

    uint256 requesterBalance = total.mul(5).div(100);
    if (requesterBalance > transferFee) {
      addProvider(dsId, requester, requesterBalance);
    }
  }

  function withdraw() external {
    uint256 balance = withdrawableBalances[msg.sender];
    require(balance > transferFee);

    withdrawableBalances[msg.sender] = 0;
    msg.sender.transfer(balance.sub(transferFee));
  }

  function getContractBalance() onlyOwner external view returns (uint256) {
    return contractBalance;
  }

  function withdrawContractBalance() onlyOwner external {
    require(contractBalance > 0);

    uint256 balance = contractBalance;
    contractBalance = 0;
    msg.sender.transfer(balance.sub(transferFee));
  }

  function balance() external view returns (uint256) {
    return withdrawableBalances[msg.sender];
  }
}
