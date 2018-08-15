from random import randint
from web3 import Web3, TestRPCProvider, HTTPProvider
from solc import compile_source
from web3.contract import ConciseContract
from web3.middleware import geth_poa_middleware
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

w3 = Web3(HTTPProvider(os.environ['WEB3_HTTP_PROVIDER']))
w3.middleware_stack.inject(geth_poa_middleware, layer=0)

class Dataset(object):

    def __init__(self, addr):
        with open('%s/contract/dataset.json' % BASE_DIR, 'r') as abi_definition:
            abi = json.load(abi_definition)

        self.contract = w3.eth.contract(address=w3.toChecksumAddress(addr), abi=abi)

    def account(self):
        return Account.privateKeyToAccount(os.environ['PRIVATE_KEY'])

    def get_nonce(self):
        global tx_count
        global last_nonce

        curr_nonce = w3.eth.getTransactionCount(os.environ['ADDRESS'])
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
        unicorn_txn = self.contract.functions.addProvider(w3.toChecksumAddress(addr), amount).buildTransaction({
            'gas': w3.toHex(3500000),
            'chainId': 4,
            'gasPrice': w3.toWei('2', 'gwei'),
            'nonce': nonce,
            'from': os.environ['ADDRESS']
        })
        print(unicorn_txn)
        acct = self.account()
        signed = acct.signTransaction(unicorn_txn)
        tx = w3.eth.sendRawTransaction(signed.rawTransaction)

        tx_count += 1

        return w3.toHex(tx)


    def pay(self, addr, tokens):
        global tx_count

        nonce = self.get_nonce()
        unicorn_txn = self.contract.functions.paid(w3.toChecksumAddress(addr), tokens).buildTransaction({
            'gas': w3.toHex(3500000),
            'chainId': 4,
            'gasPrice': w3.toWei('2', 'gwei'),
            'nonce': nonce,
            'from': os.environ['ADDRESS']
        })
        print(unicorn_txn)
        acct = self.account()
        signed = acct.signTransaction(unicorn_txn)
        tx = w3.eth.sendRawTransaction(signed.rawTransaction)

        tx_count += 1

        return w3.toHex(tx)

    def get_token(self):
        return self.contract.functions.token().call()
