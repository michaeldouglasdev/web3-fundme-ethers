import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { network } from 'hardhat';
import { ETHERSCAN_API_KEY } from '../constants/contants';
import { verify } from '../utils/verify';

const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // code here
  const { getNamedAccounts, deployments} = hre;
  const { deploy, log} = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId = 0 } = network.config;

  let ethUsdPriceFeedAddress;

  const isDevelopmentChain = developmentChains.includes(network.name);

  if (isDevelopmentChain) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;

  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress;
  }

  const args = [ethUsdPriceFeedAddress];
  console.log('antes deploy fundme', network.name);
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: isDevelopmentChain ? 0 : 6,
  });

  console.log('depois deploy fundme')
  if (!isDevelopmentChain && ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log("=====================================")

};
export default deployFundMe;
deployFundMe.tags = ['all', 'fundme']