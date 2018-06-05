import json
from web3 import Web3, TestRPCProvider, HTTPProvider
from web3.middleware import geth_poa_middleware

with open('/Users/ccbn/w/CryptoAIData/backend/contract/owner_contract_abi.json', 'r') as abi_definition:
    abi = json.load(abi_definition)

w3 = Web3(HTTPProvider('https://rinkeby.infura.io/SKMV9xjeMbG3u7MnJHVH'))
w3.middleware_stack.inject(geth_poa_middleware, layer=0)

contract_checksum = w3.toChecksumAddress('0x31Aff6F13Edece2411ED6cdA5F3E986162b44dE3')
greeter = w3.eth.contract(address=contract_checksum, abi=abi)

print(greeter.functions.ethBalance().call())
print(greeter.functions.currentSupply().call())
print(greeter.functions.size().call())

for i in range(greeter.functions.size()):
    print(i)

# unicorn_txn = contract.functions.add_amount(to, int(amount * 1000000000000000000)).buildTransaction({
#     'value': 0,
#     'gas': w3.toHex(1000000),
#     'gasPrice': w3.toWei('10000', 'gwei'),
#     'nonce': w3.eth.getTransactionCount('0x6f212bF41DF64De9782dbfb26112BD3B0e39514B'),
#     'from': '0x6f212bF41DF64De9782dbfb26112BD3B0e39514B'
# })
