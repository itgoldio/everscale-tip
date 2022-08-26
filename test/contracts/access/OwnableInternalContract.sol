pragma ton-solidity >= 0.58.1;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


import "../../../contracts/access/OwnableInternal.sol";


contract OwnableInternalContract is OwnableInternal {
    
    uint16 static _nonce;

    event Test();

    constructor(address owner) OwnableInternal(owner) public {
        tvm.accept();
    }

}
