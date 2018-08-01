pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Dataset {
  using SafeMath for uint256;

  address public owner;

  string public name;
  string public symbol;
  uint8 public decimals;

  uint256 public requestGoal;
  uint256 public currentQuantity;
  enum CreatedBy{
    Provider,
    Buyer
  }
  CreatedBy public createdBy;

  address[] public providers;
  mapping (address => uint256) public tokensOf;
  uint256 public balance;

  address public requester;
  uint256 public requestAmount;

  uint256 public ownerBalance;
  uint public FEE = 10; // 10%

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  event ProviderAdded(address indexed provider, uint256 tokens);
  event ProviderPaid(address indexed provider, uint256 amount);
  event OwnerBalanceWithdrawn(uint256 amount);
  event Buy(address indexed buyer, uint256 amount);
  event Request(address indexed requester, uint256 amount);

  constructor(address _owner, string _name, string _symbol, uint8 _decimals, uint256 _requestGoal) public {
    owner = _owner;

    name = _name;
    symbol = _symbol;
    decimals = _decimals;

    requestGoal = _requestGoal;
    if (_requestGoal == 0) {
      createdBy = CreatedBy.Provider;
    } else {
      createdBy = CreatedBy.Buyer;
    }
  }

  function setFee(uint fee) onlyOwner public {
    FEE = fee;
  }

  function addProvider(address provider, uint256 tokens) onlyOwner public {
    currentQuantity = currentQuantity.add(tokens);

    if (tokensOf[provider] == 0) {
      providers.push(provider);
    }
    tokensOf[provider] = tokensOf[provider].add(tokens);
    emit ProviderAdded(provider, tokens);
  }

  function getProviders() public view returns (address[]) {
    return providers;
  }

  function tokenOf(address provider) public view returns (uint256) {
    return tokensOf[provider];
  }

  function buy() external payable {
    require(msg.value > 0);

    uint256 fee = msg.value.mul(FEE).div(100);
    ownerBalance = ownerBalance.add(fee);

    balance = balance.add(msg.value.sub(fee));
    emit Buy(msg.sender, msg.value);
  }

  function request() external payable {
    require(msg.value > 0);
    require(currentQuantity < requestGoal);

    if (requester != address(0) && requester != msg.sender) {
      revert();
    }

    requester = msg.sender;
    requestAmount = requestAmount.add(msg.value);
    emit Request(msg.sender, msg.value);
  }

  function resetBalance() onlyOwner external {
    balance = 0;
  }

  function paid(address provider) onlyOwner external {
    require(provider != address(0));

    if (tokensOf[provider] == 0) {
      return;
    }

    if (createdBy == CreatedBy.Buyer) {
      if (currentQuantity < requestGoal) {
        return;
      }

      uint256 fee = requestAmount.mul(FEE).div(100);
      ownerBalance = ownerBalance.add(fee);

      balance = balance.add(requestAmount.sub(fee));
      requestAmount = 0;
    }

    uint256 amount = tokensOf[provider].mul(balance).div(currentQuantity);
    provider.transfer(amount);
    emit ProviderPaid(provider, amount);
  }

  function withdrawOwnerBalance() external {
    uint256 b = ownerBalance;
    ownerBalance = 0;
    owner.transfer(b);
    emit OwnerBalanceWithdrawn(b);
  }
}
