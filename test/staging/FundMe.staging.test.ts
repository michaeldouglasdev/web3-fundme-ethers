import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, deployments, network } from "hardhat";
import { FundMe } from "../../typechain-types"
import { developmentChains } from '../../helper-hardhat-config';
import { assert, expect } from "chai";

const isDevelopment = developmentChains.includes(network.name);

isDevelopment
  ? describe.skip
  : describe("FundMe", async () => {

      let fundMe: FundMe;
      let deployer: HardhatEthersSigner;
      const sendValue = ethers.parseEther('0.05');

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        fundMe = await ethers.getContractAt('FundMe', "0xE827d061074E6818Fe4F866afF2fb60B56cFd227",)
      })

      it("allows people to fund and withdraw", async () => {
        const address = await fundMe.getAddress();

        const txFundResponse = await fundMe.fund({value: sendValue});
        await txFundResponse.wait();

        const txWithdrawResponse = await fundMe.withdraw();
        await txWithdrawResponse.wait()

        const endingBalance = await ethers.provider.getBalance(address);
        console.log(
          endingBalance.toString() +
              " should equal 0, running assert equal..."
      )

        expect(endingBalance).equal(BigInt(0));
      })
    })