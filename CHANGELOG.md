# Changelog

## 1.1.2 (2022-05-07)

### Bugfixes
* [TIP4_3] Add transfer to TIP6 ITIP4_1NFT selector

### Deprecated: 
* Remove `buildIndexCode` and `buildIndexState` from Collection

## 1.1.1 (2022-04-28)

### Bugfixes
* [TIP4_3] Redeploy Indexes for transfer func.

## 1.1.0 (2022-04-28)

### Improvements
* [TIP4_1] Add: ```function transfer(address to, address sendGasTo, mapping(address => CallbackParams) callbacks) external``` to Nft

## 1.0.1 (2022-04-21)

### Bugfixes
* [TIP4_3] Recompile indexes

## 1.0.0 (2022-04-15)

TIP4_4 standard has been temporarily removed.

### Improvements
 * Remove `OwnableExternal`, add `_isOwner()`

## 0.9.0 (2022-04-14)

### Improvements
 * To work in multiple workchains in `makeAddrStd`, instead of 0, specify the wid collection of the contract (<a href="https://github.com/itgoldio/everscale-tip/pull/4/commits/4ffcd3773df9fde81e0ba029dbb3c889cdd5004c">4ffcd3773df9fde81e0ba029dbb3c889cdd5004c</a>): 
    ```diff 
    -   address.makeAddrStd(0, address);
    +   address.makeAddrStd(address(this).wid, address);
    ```
 * `_deployIndexBasis` called when creating a collection (<a href="https://github.com/itgoldio/everscale-tip/pull/4/commits/71646afcf958c47ea41bf0f4657816a6e79979d6">71646afcf958c47ea41bf0f4657816a6e79979d6</a>).
 * Transfer errors in contracts (<a href="https://github.com/itgoldio/everscale-tip/pull/4/commits/861c524fe25d08ac5977d12790d74e09d11f9a28">861c524fe25d08ac5977d12790d74e09d11f9a28</a>).

### Deprecations
 * Remove `tvm.accept()` from Nft constructors BC the deployment of the `Nft` contract occurs due to internal messages, and for them `tvm.accept()` is useless (<a href="https://github.com/itgoldio/everscale-tip/pull/4/commits/b658495d2fd02305b065a77ff1c580767f948385">b658495d2fd02305b065a77ff1c580767f948385</a>)
  
## 0.8.1 (2022-04-13)

### Improvements
 * `TIP4_3`: add `bounce: false` in responsible methods (<a href="https://github.com/itgoldio/everscale-tip/pull/3/commits/640fbc64e5303a951e277028beab645552e4e15a">640fbc64e5303a951e277028beab645552e4e15a</a>)
 * `TIP4_4` :add `bounce: false` in responsible methods (<a href="https://github.com/itgoldio/everscale-tip/pull/3/commits/e7cf763afaeeddce1866d2833d50e766e8f23ae5">e7cf763afaeeddce1866d2833d50e766e8f23ae5</a>)

### Bugfixes
* Fix `OwnableExternal` (<a href="https://github.com/itgoldio/everscale-tip/pull/3/commits/b03dcb6d5f36e8cac1fe08882e867e24d9bc3b91">b03dcb6d5f36e8cac1fe08882e867e24d9bc3b91</a>): 
    ```diff
    modifier onlyOwner() virtual {
    -   require(owner() == msg.pubkey(), 100);
    +   require(owner() == msg.sender, 100);
        require(msg.value != 0, 101);
    -   tvm.accept();
        _;
    }
    ```