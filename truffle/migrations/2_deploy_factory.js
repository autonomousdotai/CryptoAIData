var DatasetFactory = artifacts.require('./DatasetFactory');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(DatasetFactory);
  const factory = await DatasetFactory.deployed();
  await factory.createDataset(accounts[0], 'xx', 'yy', 18, 200);
  const datasets = await factory.getDatasets.call();
  console.log('address', datasets);
}
