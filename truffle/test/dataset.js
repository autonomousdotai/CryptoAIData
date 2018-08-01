const Dataset = artifacts.require('Dataset');

const BigNumber = web3.BigNumber;
const utils = web3._extend.utils;

const should = require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Dataset', async (accounts) => {
  const name = 'test';
  const symbol = 'test';
  const decimals = 18;

  const owner = accounts[0];

  const buyer = accounts[1];
  const buyer2 = accounts[2];

  const requester = accounts[3];
  const requester2 = accounts[4];

  const provider = accounts[5];
  const provider2 = accounts[6];
  const provider3 = accounts[7];

  describe('created by provider', async () => {
    const requestGoal = 0;

    it('dataset properties', async () => {
      this.dataset = await Dataset.new(owner, name, symbol, decimals, requestGoal);

      const dsOwner = await this.dataset.owner.call();
      dsOwner.should.be.equal(owner);

      const createdBy = await this.dataset.createdBy.call();
      createdBy.should.be.bignumber.equal(0);
    });

    it('add provider', async () => {
      await this.dataset.addProvider(provider, 1);
      let tokens = await this.dataset.tokenOf.call(provider);
      tokens.should.be.bignumber.equal(1);

      // add one more time
      await this.dataset.addProvider(provider, 2);
      tokens = await this.dataset.tokenOf.call(provider);
      tokens.should.be.bignumber.equal(3);

      const providers = await this.dataset.getProviders.call();
      providers.indexOf(provider).should.above(-1);
    });

    it('buy', async () => {
      let value = utils.toWei(1, 'ether');
      await this.dataset.buy({value, from: buyer});

      // owner keeps 10% by default
      let ownerBalance = await this.dataset.ownerBalance.call();
      ownerBalance.should.be.bignumber.equal(utils.toWei(0.1, 'ether'));

      let balance = await this.dataset.balance.call();
      balance.should.be.bignumber.equal(utils.toWei(0.9, 'ether'));

      // one more buy
      value = utils.toWei(2, 'ether');
      await this.dataset.buy({value, from: buyer2});

      // owner keeps 10% by default
      ownerBalance = await this.dataset.ownerBalance.call();
      ownerBalance.should.be.bignumber.equal(utils.toWei(0.3, 'ether'));

      balance = await this.dataset.balance.call();
      balance.should.be.bignumber.equal(utils.toWei(2.7, 'ether'));
    });

    it('paid for providers', async () => {
      // add some more providers
      await Promise.all([
        this.dataset.addProvider(provider2, 3),
        this.dataset.addProvider(provider3, 4)
      ]);

      const dsBalance = await this.dataset.balance.call();
      const currentQuantity = await this.dataset.currentQuantity.call();
      let tokens, providerBalance, expected, percent;

      // calculate first provider tokens
      tokens = await this.dataset.tokenOf.call(provider);
      percent = tokens.div(currentQuantity);
      providerBalance = await web3.eth.getBalance(provider);
      expected = providerBalance.add(dsBalance.mul(percent));
      // paid for first provider
      await this.dataset.paid(provider);
      // verify balance after paid
      providerBalance = await web3.eth.getBalance(provider);
      providerBalance.should.be.bignumber.equal(expected);

      // calculate second provider tokens
      tokens = await this.dataset.tokenOf.call(provider2);
      percent = tokens.div(currentQuantity);
      providerBalance = await web3.eth.getBalance(provider2);
      expected = providerBalance.add(dsBalance.mul(percent));
      // paid for second provider
      await this.dataset.paid(provider2);
      // verify balance after paid
      providerBalance = await web3.eth.getBalance(provider2);
      providerBalance.should.be.bignumber.equal(expected);

      // calculate third provider tokens
      tokens = await this.dataset.tokenOf.call(provider3);
      percent = tokens.div(currentQuantity);
      providerBalance = await web3.eth.getBalance(provider3);
      expected = providerBalance.add(dsBalance.mul(percent));
      // paid for third provider
      await this.dataset.paid(provider3);
      // verify balance after paid
      providerBalance = await web3.eth.getBalance(provider3);
      providerBalance.should.be.bignumber.equal(expected);
    });

    it('withdraw owner balance', async () => {
      const beforeWithdrawBalance = await web3.eth.getBalance(owner);
      // withdraw
      await this.dataset.withdrawOwnerBalance();
      // verify
      const afterWithdrawBalance = await web3.eth.getBalance(owner);
      afterWithdrawBalance.should.be.bignumber.above(beforeWithdrawBalance);
    });
  });

  // describe('Dataset created by buyer', async () => {
  //   it('created by buyer', async () => {
  //     const requestGoal = 1;
  //
  //     const instance = await Dataset.new(accounts[0], name, symbol, decimals, requestGoal);
  //     const createdBy = await instance.createdBy.call();
  //     createdBy.should.be.bignumber.equal(1);
  //   });
  // })
});
