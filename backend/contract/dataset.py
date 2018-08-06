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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tx_count = 0
last_nonce = 0

def compile_source_file(file_path):
    with open(file_path, 'r') as f:
        source = f.read()

    return compile_source(source)


class Dataset(object):
    w3 = Web3(HTTPProvider(os.environ['WEB3_HTTP_PROVIDER']))

    def __init__(self, addr):
        with open('%s/contract/dataset.json' % BASE_DIR, 'r') as abi_definition:
            abi = json.load(abi_definition)

        self.contract = self.w3.eth.contract(address=self.w3.toChecksumAddress(addr), abi=abi)

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


    def add_provider(self, addr, amount):
        global tx_count

        nonce = self.get_nonce()
        unicorn_txn = self.contract.functions.addProvider(self.w3.toChecksumAddress(addr), amount).buildTransaction({
            'gas': self.w3.toHex(3500000),
            'chainId': 4,
            'gasPrice': self.w3.toWei('2', 'gwei'),
            'nonce': nonce,
            'from': os.environ['ADDRESS']
        })
        print(unicorn_txn)
        acct = self.account()
        signed = acct.signTransaction(unicorn_txn)
        tx = self.w3.eth.sendRawTransaction(signed.rawTransaction)

        tx_count += 1
        print(tx_count)

        return self.w3.toHex(tx)
