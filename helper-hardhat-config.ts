import { ETH_USD_PRICE_FEED_ADDRESS, SEPOLIA_CHAIN_ID } from "./constants/contants";

type NetworkConfig = {
  [key: string]: NetworkConfigOptions;
} //& NetworkCustomOptions;

/*type NetworkCustomOptions = {
  [key: string]: NetworkConfigOptions;
}*/

interface NetworkConfigOptions {
  name: string,
  ethUsdPriceFeedAddress: string;
}

export const developmentChains = ['hardhat', 'localhost'];
export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;

export const networkConfig: NetworkConfig = {
  [SEPOLIA_CHAIN_ID]: {
    name: 'sepolia',
    ethUsdPriceFeedAddress: ETH_USD_PRICE_FEED_ADDRESS,
  },
}