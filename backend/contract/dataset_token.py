from web3 import Web3, HTTPProvider
from web3.contract import ConciseContract
from web3.middleware import geth_poa_middleware
from web3 import Account
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

w3 = Web3(HTTPProvider(os.environ['WEB3_HTTP_PROVIDER']))
w3.middleware_stack.inject(geth_poa_middleware, layer=0)

class DatasetToken(object):
    def __init__(self, addr):
        with open('%s/contract/dataset_token.json' % BASE_DIR, 'r') as abi_definition:
            abi = json.load(abi_definition)

        self.contract = w3.eth.contract(address=w3.toChecksumAddress(addr), abi=abi)


    def balance_of(self, addr):
        return self.contract.functions.balanceOf(addr).call()
