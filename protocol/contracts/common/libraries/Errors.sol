// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Errors {
    error InvalidContract();
    error IndexOutOfBounds();
    error InitParamsInvalid();
    error NotHub();
    error NotWhitelisted();
    error NotProfileOwner();
    error AlreadyRegistered();
    error AlreadyMember();
    error NotMember();
    error NotPendingMember();
}
