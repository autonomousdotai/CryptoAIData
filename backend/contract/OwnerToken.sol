pragma solidity ^0.4.8;


interface tokenRecipient {function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external;}

contract OwnerToken {
    // Public variables of the token
    string public name;
    string public symbol;
    address public ownerAddress;
    uint8 public decimals = 18;
    uint256 public currentSupply = 0;
    uint256 public ethBalance = 0;

    // This creates an array with all balances
    mapping(address => uint256) public balanceOf;

    // Look up table address user in contract
    address[] public balanceOfLUT;


    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    function OwnerToken(
        string tokenName,
        string tokenSymbol
    ) public {
        name = tokenName;
        // Set the name for display purposes
        symbol = tokenSymbol;
        // Set the symbol for display purposes
        ownerAddress = msg.sender;
    }

    /**
     * Add amount, only can be called by this contract
     */
    function add_amount(address _address, uint _value) public {
        require(_address != 0x0);
        require(msg.sender == ownerAddress);
        // Save this for an assertion in the future
        // Add the same to the recipient
        balanceOf[_address] += _value;
        currentSupply += _value;

        balanceOfLUT.push(_address);
        emit Transfer(msg.sender, _address, _value);
    }

    function reward() public {
        require(msg.sender == ownerAddress);
        for(uint i=0; i<balanceOfLUT.length; i++){
            address address_account = balanceOfLUT[i];
            uint256 address_balance = balanceOf[address_account];
            if(address_balance > 0){
                address_account.transfer(1);
            }
        }
    }

    function() payable public {
        ethBalance = msg.value;
    }

    function ethBalance() view public returns (uint256) {
        return ethBalance;
    }

    function currentSupply() view public returns (uint256) {
        return currentSupply;
    }

    function size() public returns (uint) {
        return balanceOfLUT.length;
    }

    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        require(balanceOf[_from] >= _value);
        // Check for overflows
        require(balanceOf[_to] + _value >= balanceOf[_to]);
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        // Subtract from the sender
        balanceOf[_from] -= _value;
        // Add the same to the recipient
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }
}