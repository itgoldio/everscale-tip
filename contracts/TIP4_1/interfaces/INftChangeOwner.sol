pragma ton-solidity >= 0.58.1;

interface INftChangeOwner {

    struct CallbackParams {
        uint128 value;      // ever value will send to address
        TvmCell payload;    // custom payload will be proxied to address
    }

    /// @notice change owner callback processing
    /// @param id Unique NFT id
    /// @param oldOwner Address of nft owner before owner changed
    /// @param oldManager Address of nft manager before manager changed
    /// @param newOwner Address of new nft owner
    /// @param newManager Address of new nft manager
    /// @param collection Address of collection smart contract, that mint the NFT
    /// @param sendGasTo - Address to send remaining gas
    //  @param payload - Custom payload
    function onNftChangeOwner(uint256 id, address oldOwner, address oldManager, address newOwner,  address newManager, address collection, address sendGasTo, TvmCell payload) external;
}