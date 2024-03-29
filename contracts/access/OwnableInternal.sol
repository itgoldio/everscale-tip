pragma ton-solidity >= 0.58.1;

/// @title This extension is used to add the owner role to the contract. It is used to manage contracts through internal messages.
abstract contract OwnableInternal {
    
    /// Owner address (0:...)
    address private _owner;

    event OwnershipTransferred(address oldOwner, address newOwner);

    constructor (address owner) public {
        _transferOwnership(owner);
    }

    function owner() public view virtual returns (address owner) {
        return _owner;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner.value != 0, 100);
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /// @dev придумать, как хранить ошибки в extensions
    modifier onlyOwner() virtual {
        require(owner() == msg.sender, 100);
        require(msg.value != 0, 101);
        _;
    }

}