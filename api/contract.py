from random import randint
from web3 import Web3, TestRPCProvider, HTTPProvider
from solc import compile_source
from web3.contract import ConciseContract
from web3 import Account
import requests
import time
import os
import json
from solc import compile_source


def compile_source_file(file_path):
    with open(file_path, 'r') as f:
        source = f.read()

    return compile_source(source)


class TokenERC20Factory(object):
    PRIVATE_KEY = os.environ['PRIVATE_KEY']
    ADDRESS = os.environ['ADDRESS']

    def __init__(self, name, symbol, totalSupply):
        self.name = name
        self.symbol = symbol
        self.totalSupply = totalSupply

    def create_contract_tx_hash(self):
        compiled_sol = compile_source_file('TokenERC20.sol')
        contract_interface = compiled_sol['<stdin>:TokenERC20']

        # web3.py instance
        w3 = Web3(HTTPProvider('https://rinkeby.infura.io/SKMV9xjeMbG3u7MnJHVH'))

        # Instantiate and deploy contract
        contract = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])

        with open('earth_contract_abi.json', 'w') as outfile:
            json.dump(contract_interface['abi'], outfile)

        data = contract._encode_constructor_data(args=(self.totalSupply, self.name, self.symbol))
        transaction = {'data': data,
                       'gas': randint(3000000, 4000000),
                       'gasPrice': randint(8000000, 10000000),
                       'chainId': 4,
                       'to': '',
                       'from': self.ADDRESS,
                       'nonce': w3.eth.getTransactionCount(self.ADDRESS)}
        acct = Account.privateKeyToAccount(self.PRIVATE_KEY)
        signed = acct.signTransaction(transaction)
        tx = w3.eth.sendRawTransaction(signed.rawTransaction)
        tx_hash = w3.toHex(tx)
        return tx_hash


print(TokenERC20Factory('Earth coin', 'EARTH', 100000000).create_contract_tx_hash())
# Contract address: 0xe49e87f42f15482f40e6b4c4ebe2310278acf297
