pragma ton-solidity >= 0.58.1;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


import "../../../contracts/TIP6/TIP6.sol";


contract TIP6Con is TIP6 {
    
    constructor() public {
        tvm.accept();

        _supportedInterfaces[ bytes4(tvm.functionId(ITIP6.supportsInterface)) ] = true;
    }

}
