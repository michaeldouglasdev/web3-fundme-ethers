
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { deployments, ethers, network } from 'hardhat';
import { send } from 'process';
import { FundMe, FundMe__factory, MockV3Aggregator } from '../../typechain-types';
import { developmentChains } from '../../helper-hardhat-config';

// getSigners is going to return
// whatever is in this accoun section of your network;

const isDevelopment = developmentChains.includes(network.name);

isDevelopment
  ? describe("FundMe", async () => {
    let fundMe: FundMe;
    let deployer: HardhatEthersSigner;
    let mockV3Aggregator: MockV3Aggregator;
    const sendValue = ethers.parseEther('1');

    beforeEach(async () => {
      // deploy using hardhat deploy tags
      //const accounts = ethers.get
      //deployer = await getNamedAccounts();
      const accounts  = await ethers.getSigners();
      deployer = accounts[0];

      await deployments.fixture(['all']);

      const deployedMockV3Aggregator = await deployments.get('MockV3Aggregator');
      const deployedFundMe = await deployments.get('FundMe');

      // Pass deployer to connect him to contract
      fundMe = await ethers.getContractAt("FundMe", deployedFundMe.address, deployer);
      mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", deployedMockV3Aggregator.address, deployer )
      //viem.getContractAt()
    });

    describe("constructor", async () => {
      it("sets the aggregator addresses correctly", async () => {
        const response = await fundMe.s_priceFeed();
        expect(response).equal(mockV3Aggregator);
      })
    })

    describe("fundme", async () => {
      it("Fails if you dont send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
      })

      it("updated the amount funded data structure", async () => {
        await fundMe.fund({ value: sendValue});
        const amount = await fundMe.getAddressToAmountFunded(deployer.address);

        expect(amount.toString(), sendValue.toString());
      })

      it("Adds funder to array of funders", async () => {
        await fundMe.fund({value: sendValue});
        const funderAddress = await fundMe.getFunder(0);

        expect(funderAddress, deployer.address);
      })
    })

    describe("withdraw", async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      })

      it("withdraw ETH from a single founder", async () => {
        //const startingFundMe = await
        const address = await fundMe.getAddress();
        const startingFundMeBalance = await ethers.provider.getBalance(address);
        const startingDeployerBalance = await ethers.provider.getBalance(deployer.address);

        const tx = await fundMe.withdraw();
        const txReceipt = await tx.wait();

        const { gasUsed, gasPrice } = txReceipt!
        const totalGas = gasUsed * gasPrice;

        const endingFundMeBalance = await ethers.provider.getBalance(address);
        const endingDeployerBalance = await ethers.provider.getBalance(deployer.address);

        expect(endingFundMeBalance).equal(0);
        expect(startingFundMeBalance + startingDeployerBalance).equal(endingDeployerBalance + totalGas);

      })

      it("allow us to withdraw with multiple funders", async () => {
        const accounts = await ethers.getSigners();
        const address = await fundMe.getAddress();

        await fundMe.connect(accounts[1]).fund({ value: sendValue});
        await fundMe.connect(accounts[2]).fund({ value: sendValue});
        await fundMe.connect(accounts[3]).fund({ value: sendValue});
        await fundMe.connect(accounts[4]).fund({ value: sendValue});
        await fundMe.connect(accounts[5]).fund({ value: sendValue});

        const startingFundMeBalance = await ethers.provider.getBalance(address);
        const startingSignerBalance = await ethers.provider.getBalance(deployer);

        const txResponse = await fundMe.withdraw();
        const txReceipt = await txResponse.wait();

        const endingFundMeBalance = await ethers.provider.getBalance(address);
        const endingSignerBalance = await ethers.provider.getBalance(deployer);

        const { gasPrice, gasUsed} = txReceipt!;
        const totalGas = gasPrice * gasUsed;

        expect(endingFundMeBalance).equal(BigInt(0));
        expect(startingFundMeBalance + startingSignerBalance).equal(endingSignerBalance + totalGas)

        // Check if is reseted
        await expect(fundMe.getFunder(0)).to.be.reverted;


        for (let i = 1; i < 6; i++) {
          const signerAmount = await fundMe.getAddressToAmountFunded(accounts[i].address);
          expect(signerAmount).equal(BigInt(0));
        }
      })

      it("Only allows the owner to withdraw", async () => {
        const accounts = await ethers.getSigners();

        const fundMeConnected = fundMe.connect(accounts[1]);

        await expect(fundMeConnected.withdraw()).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
      })
    });

    it("cheaper withdraw", async () => {
        const accounts = await ethers.getSigners();
        const address = await fundMe.getAddress();

        await fundMe.connect(accounts[1]).fund({ value: sendValue});
        await fundMe.connect(accounts[2]).fund({ value: sendValue});
        await fundMe.connect(accounts[3]).fund({ value: sendValue});
        await fundMe.connect(accounts[4]).fund({ value: sendValue});
        await fundMe.connect(accounts[5]).fund({ value: sendValue});

        const startingFundMeBalance = await ethers.provider.getBalance(address);
        const startingSignerBalance = await ethers.provider.getBalance(deployer);

        const txResponse = await fundMe.withdrawV2();
        const txReceipt = await txResponse.wait();

        const endingFundMeBalance = await ethers.provider.getBalance(address);
        const endingSignerBalance = await ethers.provider.getBalance(deployer);

        const { gasPrice, gasUsed} = txReceipt!;
        const totalGas = gasPrice * gasUsed;

        expect(endingFundMeBalance).equal(BigInt(0));
        expect(startingFundMeBalance + startingSignerBalance).equal(endingSignerBalance + totalGas)

        // Check if is reseted
        await expect(fundMe.getFunder(0)).to.be.reverted;

        for (let i = 1; i < 6; i++) {
          const signerAmount = await fundMe.getAddressToAmountFunded(accounts[i].address);
          expect(signerAmount).equal(BigInt(0));
        }
      })
  })
  : describe.skip;