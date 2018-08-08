const Dataset = artifacts.require('Dataset');
const DatasetFactory = artifacts.require('DatasetFactory');
const DatasetToken = artifacts.require('DatasetToken');

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

  describe('Dataset created by provider', async () => {
    const requestGoal = 0;

    before(async () => {
      this.token = await DatasetToken.new(name, symbol, decimals);
      this.dataset = await Dataset.new(owner, this.token.address, requestGoal);
      await this.token.transferOwnership(this.dataset.address);
    });

    it('verify dataset properties', async () => {
      const dsOwner = await this.dataset.owner.call();
      dsOwner.should.be.equal(owner);

      const createdBy = await this.dataset.createdBy.call();
      createdBy.should.be.bignumber.equal(0);
    });

    it('add provider', async () => {
      await this.dataset.addProvider(provider, 1);
      let tokens = await this.token.balanceOf.call(provider);
      tokens.should.be.bignumber.equal(1);

      // add more tokens
      await this.dataset.addProvider(provider, 2);
      tokens = await this.token.balanceOf.call(provider);
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

      // buy one more time
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
      let tokens, beforePaid, afterPaid, expected;

      // calculate first provider tokens
      tokens = await this.token.balanceOf.call(provider);
      beforePaid = await web3.eth.getBalance(provider);
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      // paid for first provider
      await this.dataset.paid(provider, tokens);
      // verify balance after paid
      afterPaid = await web3.eth.getBalance(provider);
      afterPaid.should.be.bignumber.equal(expected);

      // calculate second provider tokens
      tokens = await this.token.balanceOf.call(provider2);
      beforePaid = await web3.eth.getBalance(provider2);
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      // paid for second provider
      await this.dataset.paid(provider2, tokens);
      // verify balance after paid
      afterPaid = await web3.eth.getBalance(provider2);
      afterPaid.should.be.bignumber.equal(expected);

      // calculate third provider tokens
      tokens = await this.token.balanceOf.call(provider3);
      beforePaid = await web3.eth.getBalance(provider3);
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      // paid for third provider
      await this.dataset.paid(provider3, tokens);
      // verify balance after paid
      afterPaid = await web3.eth.getBalance(provider3);
      afterPaid.should.be.bignumber.equal(expected);
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

  describe('Dataset created by buyer', async () => {
    const requestGoal = 5;

    before(async () => {
      this.token = await DatasetToken.new(name, symbol, decimals);
      this.dataset = await Dataset.new(accounts[0], this.token.address, requestGoal);
      await this.token.transferOwnership(this.dataset.address);
    });

    it('verify dataset properties', async () => {
      const dsOwner = await this.dataset.owner.call();
      dsOwner.should.be.equal(owner);

      const createdBy = await this.dataset.createdBy.call();
      createdBy.should.be.bignumber.equal(1);
    });

    it('requester send eth to created dataset', async () => {
      let value = utils.toWei(1, 'ether');
      await this.dataset.request({value, from: requester});

      // verify requester
      const dsRequester = await this.dataset.requester.call();
      dsRequester.should.be.equal(requester);

      let dsRequestAmount = await this.dataset.requestAmount.call();
      dsRequestAmount.should.be.bignumber.equal(utils.toWei(1, 'ether'));

      // one more request
      value = utils.toWei(4, 'ether');
      await this.dataset.request({value, from: requester});

      dsRequestAmount = await this.dataset.requestAmount.call();
      dsRequestAmount.should.be.bignumber.equal(utils.toWei(5, 'ether'));
    });

    it('paid for providers', async () => {
      // add provider
      await this.dataset.addProvider(provider, 1);

      // try to paid when the dataset hasn't reach goal yet
      let beforePaid = await web3.eth.getBalance(provider);
      await this.dataset.paid(provider, 1);
      let afterPaid = await web3.eth.getBalance(provider);
      afterPaid.should.be.bignumber.equal(beforePaid);

      // add more providers to make the goal reached
      await Promise.all([
        this.dataset.addProvider(provider2, 1),
        this.dataset.addProvider(provider3, 3),
      ]);

      const currentQuantity = await this.dataset.currentQuantity.call();

      // paid for first provider
      let tokens = await this.token.balanceOf.call(provider);
      beforePaid = await web3.eth.getBalance(provider);
      await this.dataset.paid(provider, tokens);

      // owner keeps 10% by default
      const ownerBalance = await this.dataset.ownerBalance.call();
      ownerBalance.should.be.bignumber.equal(utils.toWei(0.5, 'ether'));

      const dsBalance = await this.dataset.balance.call();
      dsBalance.should.be.bignumber.equal(utils.toWei(4.5, 'ether'));

      // the request amount should be 0 now
      const requestAmount = await this.dataset.requestAmount.call();
      requestAmount.should.be.bignumber.equal(0);

      // verify provider balance
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      afterPaid = await web3.eth.getBalance(provider);
      afterPaid.should.be.bignumber.equal(expected);

      // paid for second provider
      tokens = await this.token.balanceOf.call(provider2);
      beforePaid = await web3.eth.getBalance(provider2);
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      await this.dataset.paid(provider2, tokens);
      afterPaid = await web3.eth.getBalance(provider2);
      afterPaid.should.be.bignumber.equal(expected);

      // paid for third provider
      tokens = await this.token.balanceOf.call(provider3);
      beforePaid = await web3.eth.getBalance(provider3);
      expected = beforePaid.add(tokens.mul(dsBalance).div(currentQuantity));
      await this.dataset.paid(provider3, tokens);
      afterPaid = await web3.eth.getBalance(provider3);
      afterPaid.should.be.bignumber.equal(expected);
    });
  });
});
