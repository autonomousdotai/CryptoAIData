import json
from web3 import Web3, TestRPCProvider, HTTPProvider
from web3.middleware import geth_poa_middleware

with open('/Users/ccbn/w/CryptoAIData/backend/contract/owner_contract_abi.json', 'r') as abi_definition:
    abi = json.load(abi_definition)

w3 = Web3(HTTPProvider('https://rinkeby.infura.io/SKMV9xjeMbG3u7MnJHVH'))
w3.middleware_stack.inject(geth_poa_middleware, layer=0)

contract_checksum = w3.toChecksumAddress('0x18bA0C0A1908A781d4EA282b69d8a4C6b67b494C')
contract = w3.eth.contract(address=contract_checksum, abi=abi)

print(contract.functions.ethBalance().call())
print(contract.functions.size().call())

current_supply = contract.functions.reward().call()

