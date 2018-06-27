contract DataAIToken{

    // Public variables of the token
    string public name; 
    string public symbol; 
    address public ownerAddress;
    uint8 public decimals = 18; 
    uint256 public currentSupply = 0; 
    uint ProviderCreated=1 
    uint BuyerCreated=2 

    struct DataSet {
        address datasetAddr; // Address to hold this dataset.
        uint createType;  // dataset create buy provider or buyer
        uint requestGoal; // request quanlity by buyer if createType is buyer. else = 0
        uint currentQuanlity; // request quanlity by buyer if createType is buyer. else = 0 
        address[] public providers; // provider list.

    } 
    uint numDatasets;
    mapping (uint => DataSet) public dataSets;
 
    //DEPLOY CONTRACT
    function DataAIToken(
        string tokenName,
        string tokenSymbol
    ) payable public {
        name = tokenName;
        // Set the name for display purposes
        symbol = tokenSymbol;
        // Set the symbol for display purposes
        ownerAddress = msg.sender;
    }

    //NEW DATASET
    function DataSet(address datasetAddr, uint createType, uint requestGoal) public returns (uint DataSetID) {
        DataSetID = numDatasets++; //DataSetID is return variable
        // Creates new struct and saves in storage. We leave out the mapping type.
        dataSets[DataSetID] = DataSet(datasetAddr, createType, requestGoal, 0);
    }

   function contribute(uint DataSetID) public payable {
        DataSet storage c = dataSets[DataSetID];
        // Creates a new temporary memory struct, initialised with the given values
        // and copies it over to storage.
        // Note that you can also use Funder(msg.sender, msg.value) to initialise.
        //c.funders[c.numFunders++] = Funder({addr: msg.sender, amount: msg.value});
        //c.amount += msg.value;
    }

    /**
     * Add amount, only can be called by this contract
     */
    function add_amount(address _address, uint _value) public {
        require(_address != 0x0);
        require(msg.sender == ownerAddress); 
    }

    



}