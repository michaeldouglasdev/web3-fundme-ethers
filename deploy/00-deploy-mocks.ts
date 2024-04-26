import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, developmentChains, INITIAL_ANSWER } from "../helper-hardhat-config";

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts} = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('log mocks')
  if (developmentChains.includes(network.name)) {
    console.log('if mocks')
    log('Local Network detected! Deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    });

    log("Mocks deployed");
    log("=======================")
  }
}

export default deployMocks;
deployMocks.tags = ['all', 'mocks']

