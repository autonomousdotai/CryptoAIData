from web3 import Web3, HTTPProvider
from web3.contract import ConciseContract
from web3.middleware import geth_poa_middleware
from web3 import Account
import os
import json

tx_count = 0
last_nonce = 0

w3 = Web3(HTTPProvider(os.environ['WEB3_HTTP_PROVIDER']))
w3.middleware_stack.inject(geth_poa_middleware, layer=0)

class Dataset(object):

    def __init__(self, addr):
        with open('./dataset.json', 'r') as abi_definition:
            abi = json.load(abi_definition)

        self.contract = w3.eth.contract(address=w3.toChecksumAddress(addr), abi=abi)


    def get_providers(self):
        return self.contract.functions.getProviders().call()


    def get_token(self):
        return self.contract.functions.token().call()
