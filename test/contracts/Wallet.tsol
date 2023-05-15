pragma ton-solidity >= 0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

contract Account {
    uint public owner;
    uint public static _randomNonce;

    modifier onlyOwner() {
        require(msg.pubkey() == owner, 501);
        _;
    }

    modifier checkPubKey() {
        require(msg.pubkey() == tvm.pubkey(), 500);
        _;
    }

    constructor() public checkPubKey {
        tvm.accept();
        setOwnership(msg.pubkey());
    }

    function setOwnership(uint newOwner) internal {
        owner = newOwner;
    }

    function sendTransaction(
        address dest,
        uint128 value,
        bool bounce,
        uint8 flags,
        TvmCell payload
    )
        public
        view
        onlyOwner
    {
        tvm.accept();

        dest.transfer(value, bounce, flags, payload);
    }
}