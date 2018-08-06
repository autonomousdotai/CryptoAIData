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
import os
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tx_count = 0
last_nonce = 0

def compile_source_file(file_path):
    with open(file_path, 'r') as f:
        source = f.read()

    return compile_source(source)


class DatasetFactory(object):
    w3 = Web3(HTTPProvider(os.environ['WEB3_HTTP_PROVIDER']))

    def __init__(self):
        with open('%s/contract/dataset_factory.json' % BASE_DIR, 'r') as abi_definition:
            abi = json.load(abi_definition)

        self.contract = self.w3.eth.contract(address=self.w3.toChecksumAddress(os.environ['DATASET_FACTORY_ADDRESS']), abi=abi)

    def account(self):
        return Account.privateKeyToAccount(os.environ['PRIVATE_KEY'])

    def get_nonce(self):
        global tx_count
        global last_nonce

        curr_nonce = self.w3.eth.getTransactionCount(os.environ['ADDRESS'])
        if last_nonce == curr_nonce:
            return curr_nonce + tx_count

        tx_since_last_nonce = last_nonce + tx_count
        if curr_nonce >= tx_since_last_nonce:
            tx_count = 0
            last_nonce = curr_nonce
            return curr_nonce
        else:
            return tx_since_last_nonce


    def get_tx_receipt(self, tx):
        receipt = self.w3.eth.getTransactionReceipt(tx)
        while receipt is None:
            receipt = self.w3.eth.getTransactionReceipt(tx)
            time.sleep(5)
        log = self.contract.events.DatasetCreated().processReceipt(receipt)
        contract_addr = log[0]['args']['ds']
        return contract_addr


    def create_dataset(self, name, symbol, request_goal):
        global tx_count

        nonce = self.get_nonce()
        unicorn_txn = self.contract.functions.createDataset(os.environ['ADDRESS'], name, symbol, 18, request_goal).buildTransaction({
            'gas': self.w3.toHex(3000000),
            'chainId': 4,
            'gasPrice': self.w3.toWei('1', 'gwei'),
            'nonce': nonce,
            'from': os.environ['ADDRESS']
        })
        print(unicorn_txn)
        acct = self.account()
        signed = acct.signTransaction(unicorn_txn)
        tx = self.w3.eth.sendRawTransaction(signed.rawTransaction)
        tx = self.w3.toHex(tx)
        contract_addr = self.get_tx_receipt(tx)

        tx_count += 1

        return tx, contract_addr



#  compiled_sol = compile_source_file('/Users/apple/Projects/CryptoAIData/truffle/contracts/DatasetFactory.sol')
#  contract_interface = compiled_sol['<stdin>:DatasetFactory']
#
#  # web3.py instance
#  w3 = Web3(HTTPProvider('https://rinkeby.infura.io/RdeatTLhBhkxE5KaA0v7'))
#
#  # Instantiate and deploy contract
#  contract = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
#
#  with open('%s/contract/dataset_factory.json' % BASE_DIR, 'w') as outfile:
#      json.dump(contract_interface['abi'], outfile)
#
#  data = contract._encode_constructor_data(args=('name', 'token'))
#  acct = Account.privateKeyToAccount(os.environ['PRIVATE_KEY'])
#  transaction = {'data': data,
#                  'gas': w3.toHex(1000000),
#                  'gasPrice': w3.toWei('1000', 'gwei'),
#                  'chainId': 4,
#                  'to': '',
#                  'from': os.environ['ADDRESS'],
#                  'nonce': w3.eth.getTransactionCount(acct.address)
#                  }
#  signed = acct.signTransaction(transaction)
#  tx = w3.eth.sendRawTransaction(signed.rawTransaction)
#  tx_hash = w3.toHex(tx)
#  print(tx_hash) # https://api-rinkeby.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=0x5fa763ee5c007253e615225fd9db5f66d136dcafc583ee4cf8f9b9ee3c957d3f&apikey=YourApiKeyToken
