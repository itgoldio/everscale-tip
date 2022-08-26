pragma ton-solidity >= 0.58.1;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


import "../../../contracts/access/OwnableExternal.sol";


contract OwnableExternalContract is OwnableExternal {
    
    uint16 static _nonce;

    event Test();

    constructor(uint256 owner) OwnableExternal(owner) public {
        tvm.accept();
    }

}
