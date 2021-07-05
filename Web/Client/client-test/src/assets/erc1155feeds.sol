// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma abicoder v2;

interface ERC1155TokenReceiver {
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4);
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IFeedsContractProxiable {
    function updateCodeAddress(address _newAddress) external;

    function getCodeAddress() external view returns (address);
}

interface IERC1155 {
    event TransferSingle(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256 _id,
        uint256 _value
    );

    event TransferBatch(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256[] _ids,
        uint256[] _values
    );

    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    event URI(string _value, uint256 indexed _id);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external;

    function balanceOf(address _owner, uint256 _id) external view returns (uint256);

    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids)
        external
        view
        returns (uint256[] memory);

    function setApprovalForAll(address _operator, bool _approved) external;

    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

interface ISimpleTransfer {
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value
    ) external;

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values
    ) external;
}

interface ITokenMetaData {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function uri(uint256 _id) external view returns (string memory);

    function uriBatch(uint256[] calldata _ids) external view returns (string[] memory);
}

interface ITokenEnumerable {
    function totalSupply() external view returns (uint256);

    function tokenSupply(uint256 _id) external view returns (uint256);

    function tokenSupplyBatch(uint256[] calldata _ids) external view returns (uint256[] memory);

    function tokenIdByIndex(uint256 _index) external view returns (uint256);

    function tokenIdByIndexBatch(uint256[] calldata _indexes) external view returns (uint256[] memory);

    function tokenCountOfOwner(address _owner) external view returns (uint256);

    function tokenCountOfOwnerBatch(address[] calldata _owners) external view returns (uint256[] memory);

    function tokenIdOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);

    function tokenIdOfOwnerByIndexBatch(address _owner, uint256[] calldata _indexes)
        external
        view
        returns (uint256[] memory);
}

interface ITokenRoyalty {
    event RoyaltyOwner(address indexed _owner, uint256 indexed _id);

    event RoyaltyFee(uint256 _fee, uint256 indexed _id);

    function tokenRoyaltyOwner(uint256 _id) external view returns (address);

    function tokenRoyaltyOwnerBatch(uint256[] calldata _ids) external view returns (address[] memory);

    function tokenRoyaltyFee(uint256 _id) external view returns (uint256);

    function tokenRoyaltyFeeBatch(uint256[] calldata _ids) external view returns (uint256[] memory);
}

interface ITokenMintable {
    function mint(
        uint256 _id,
        uint256 _tokenSupply,
        string calldata _uri,
        uint256 _royaltyFee
    ) external;
}

interface ITokenBurnable {
    function burn(uint256 _id, uint256 _value) external;

    function burnFrom(
        address _owner,
        uint256 _id,
        uint256 _value
    ) external;
}

interface ITokenInfo {
    struct TokenInfo {
        uint256 tokenId;
        uint256 tokenIndex;
        uint256 tokenSupply;
        string tokenUri;
        address royaltyOwner;
        uint256 royaltyFee;
    }

    function tokenInfo(uint256 _id) external view returns (TokenInfo memory);

    function tokenInfoBatch(uint256[] calldata _ids) external view returns (TokenInfo[] memory);
}

interface ITokenCompatibility {
    function decimals() external view returns (uint8);
}

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }

        c = a * b;
        require(c / a == b, "SafeMath mul failed");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath sub failed");
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, "SafeMath add failed");
        return c;
    }
}

library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }
}

abstract contract BaseUtils is IFeedsContractProxiable {
    bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61;
    bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC165 = 0x01ffc9a7;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC1155 = 0xd9b67a26;
    bytes4 internal constant INTERFACE_SIGNATURE_TokenRoyalty = 0x96f7b536;
    bytes4 internal constant INTERFACE_SIGNATURE_FeedsContractProxiable = 0xc1fdc5a0;

    uint256 internal constant RATE_BASE = 1000000;

    uint256 private guard;
    uint256 private constant GUARD_PASS = 1;
    uint256 private constant GUARD_BLOCK = 2;

    address public owner;
    bool public initialized = false;

    function _initialize() internal {
        require(!initialized, "Contract already initialized");
        initialized = true;
        guard = GUARD_PASS;
        owner = msg.sender;
    }

    function initialize() external {
        _initialize();
    }

    modifier inited() {
        require(initialized, "Contract not initialized");
        _;
    }

    modifier reentrancyGuard() {
        require(guard != GUARD_BLOCK, "Reentrancy blocked");
        guard = GUARD_BLOCK;
        _;
        guard = GUARD_PASS;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender must be owner");
        _;
    }

    function transferOwnership(address _owner) external inited onlyOwner {
        owner = _owner;
    }

    function updateCodeAddress(address _newAddress) external override inited onlyOwner {
        require(IERC165(_newAddress).supportsInterface(0xc1fdc5a0), "Contract address not proxiable");

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, _newAddress)
        }
    }

    function getCodeAddress() external view override returns (address _codeAddress) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            _codeAddress := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
        }
    }
}

contract FeedsNFTSticker is
    IERC165,
    IERC1155,
    ISimpleTransfer,
    ITokenMetaData,
    ITokenEnumerable,
    ITokenRoyalty,
    ITokenMintable,
    ITokenBurnable,
    ITokenCompatibility,
    ITokenInfo,
    BaseUtils
{
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(uint256 => mapping(address => uint256)) internal balances;
    mapping(address => mapping(address => bool)) internal operatorApproval;

    mapping(uint256 => TokenInfo) internal tokenIdToToken;
    uint256[] internal tokenIds;

    mapping(address => uint256[]) internal ownerToTokenIds;
    mapping(uint256 => mapping(address => uint256)) internal tokenIdToIndexByOwner;

    string internal constant name_ = "Feeds NFT Sticker";
    string internal constant symbol_ = "FSTK";
    string internal constant version = "v0.1";
    string internal constant magic = "20210511";

    function supportsInterface(bytes4 _interfaceId) external pure override returns (bool) {
        return
            _interfaceId == INTERFACE_SIGNATURE_ERC165 ||
            _interfaceId == INTERFACE_SIGNATURE_ERC1155 ||
            _interfaceId == INTERFACE_SIGNATURE_TokenRoyalty ||
            _interfaceId == INTERFACE_SIGNATURE_FeedsContractProxiable;
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external override inited reentrancyGuard {
        _safeTransferFrom(_from, _to, _id, _value, _data);
    }

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external override inited reentrancyGuard {
        _safeBatchTransferFrom(_from, _to, _ids, _values, _data);
    }

    function balanceOf(address _owner, uint256 _id) external view override returns (uint256) {
        return balances[_id][_owner];
    }

    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids)
        external
        view
        override
        returns (uint256[] memory)
    {
        require(_owners.length == _ids.length, "_owners and _ids length mismatch");

        uint256[] memory _balances = new uint256[](_owners.length);

        for (uint256 i = 0; i < _owners.length; ++i) {
            _balances[i] = balances[_ids[i]][_owners[i]];
        }

        return _balances;
    }

    function setApprovalForAll(address _operator, bool _approved) external override {
        operatorApproval[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function isApprovedForAll(address _owner, address _operator) external view override returns (bool) {
        return operatorApproval[_owner][_operator];
    }

    function _safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes memory _data
    ) internal {
        require(_to != address(0x0), "Receiver cannot be zero address");
        require(_from == msg.sender || operatorApproval[_from][msg.sender] == true, "Sender is not operator");
        require(balances[_id][_from] >= _value, "Not enough token balance");

        if (balances[_id][_to] <= 0 && _value > 0) {
            _addTokenToOwner(_id, _to);
        }

        balances[_id][_from] = balances[_id][_from].sub(_value);
        balances[_id][_to] = _value.add(balances[_id][_to]);

        if (balances[_id][_from] <= 0 && _value > 0) {
            _removeTokenFromOwner(_id, _from);
        }

        emit TransferSingle(msg.sender, _from, _to, _id, _value);

        if (_to.isContract()) {
            require(
                ERC1155TokenReceiver(_to).onERC1155Received(msg.sender, _from, _id, _value, _data) ==
                    ERC1155_ACCEPTED,
                "Receiving contract not accepting ERC1155 tokens"
            );
        }
    }

    function _safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _values,
        bytes memory _data
    ) internal {
        require(_to != address(0x0), "Receiver cannot be zero address");
        require(_ids.length == _values.length, "_ids and _values length mismatch");
        require(_from == msg.sender || operatorApproval[_from][msg.sender] == true, "Sender is not operator");

        for (uint256 i = 0; i < _ids.length; ++i) {
            uint256 id = _ids[i];
            uint256 value = _values[i];
            require(balances[id][_from] >= value, "Not enough token balance");

            if (balances[id][_to] <= 0 && value > 0) {
                _addTokenToOwner(id, _to);
            }

            balances[id][_from] = balances[id][_from].sub(value);
            balances[id][_to] = value.add(balances[id][_to]);

            if (balances[id][_from] <= 0 && value > 0) {
                _removeTokenFromOwner(id, _from);
            }
        }

        emit TransferBatch(msg.sender, _from, _to, _ids, _values);

        if (_to.isContract()) {
            require(
                ERC1155TokenReceiver(_to).onERC1155BatchReceived(msg.sender, _from, _ids, _values, _data) ==
                    ERC1155_BATCH_ACCEPTED,
                "Receiving contract not accepting ERC1155 tokens"
            );
        }
    }

    function _addTokenToOwner(uint256 _id, address _owner) internal {
        require(tokenIdToIndexByOwner[_id][_owner] == 0, "Something is wrong with _addTokenToOwner");
        if (ownerToTokenIds[_owner].length > 0) {
            require(ownerToTokenIds[_owner][0] != _id, "Something is wrong with _addTokenToOwner");
        }
        ownerToTokenIds[_owner].push(_id);
        tokenIdToIndexByOwner[_id][_owner] = ownerToTokenIds[_owner].length.sub(1);
    }

    function _removeTokenFromOwner(uint256 _id, address _owner) internal {
        require(
            ownerToTokenIds[_owner][tokenIdToIndexByOwner[_id][_owner]] == _id,
            "Something is wrong with _removeTokenFromOwner"
        );
        uint256 lastId = ownerToTokenIds[_owner][ownerToTokenIds[_owner].length.sub(1)];
        if (lastId == _id) {
            tokenIdToIndexByOwner[_id][_owner] = 0;
            ownerToTokenIds[_owner].pop();
        } else {
            uint256 index = tokenIdToIndexByOwner[_id][_owner];
            tokenIdToIndexByOwner[_id][_owner] = 0;
            ownerToTokenIds[_owner][index] = lastId;
            ownerToTokenIds[_owner].pop();
            tokenIdToIndexByOwner[lastId][_owner] = index;
        }
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value
    ) external override inited reentrancyGuard {
        _safeTransferFrom(_from, _to, _id, _value, "");
    }

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values
    ) external override inited reentrancyGuard {
        _safeBatchTransferFrom(_from, _to, _ids, _values, "");
    }

    function name() external pure override returns (string memory) {
        return name_;
    }

    function symbol() external pure override returns (string memory) {
        return symbol_;
    }

    function uri(uint256 _id) external view override returns (string memory) {
        return tokenIdToToken[_id].tokenUri;
    }

    function uriBatch(uint256[] calldata _ids) external view override returns (string[] memory) {
        string[] memory _uris = new string[](_ids.length);

        for (uint256 i = 0; i < _ids.length; ++i) {
            _uris[i] = tokenIdToToken[_ids[i]].tokenUri;
        }

        return _uris;
    }

    function totalSupply() external view override returns (uint256) {
        return tokenIds.length;
    }

    function tokenSupply(uint256 _id) external view override returns (uint256) {
        return tokenIdToToken[_id].tokenSupply;
    }

    function tokenSupplyBatch(uint256[] calldata _ids) external view override returns (uint256[] memory) {
        uint256[] memory _amounts = new uint256[](_ids.length);

        for (uint256 i = 0; i < _ids.length; ++i) {
            _amounts[i] = tokenIdToToken[_ids[i]].tokenSupply;
        }

        return _amounts;
    }

    function tokenIdByIndex(uint256 _index) external view override returns (uint256) {
        return tokenIds[_index];
    }

    function tokenIdByIndexBatch(uint256[] calldata _indexes) external view override returns (uint256[] memory) {
        uint256[] memory _ids = new uint256[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _ids[i] = tokenIds[_indexes[i]];
        }

        return _ids;
    }

    function tokenCountOfOwner(address _owner) external view override returns (uint256) {
        return ownerToTokenIds[_owner].length;
    }

    function tokenCountOfOwnerBatch(address[] calldata _owners) external view override returns (uint256[] memory) {
        uint256[] memory _counts = new uint256[](_owners.length);

        for (uint256 i = 0; i < _owners.length; ++i) {
            _counts[i] = ownerToTokenIds[_owners[i]].length;
        }

        return _counts;
    }

    function tokenIdOfOwnerByIndex(address _owner, uint256 _index) external view override returns (uint256) {
        return ownerToTokenIds[_owner][_index];
    }

    function tokenIdOfOwnerByIndexBatch(address _owner, uint256[] calldata _indexes)
        external
        view
        override
        returns (uint256[] memory)
    {
        uint256[] memory _ids = new uint256[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _ids[i] = ownerToTokenIds[_owner][_indexes[i]];
        }

        return _ids;
    }

    function tokenRoyaltyOwner(uint256 _id) external view override returns (address) {
        return tokenIdToToken[_id].royaltyOwner;
    }

    function tokenRoyaltyOwnerBatch(uint256[] calldata _ids) external view override returns (address[] memory) {
        address[] memory _owners = new address[](_ids.length);

        for (uint256 i = 0; i < _ids.length; ++i) {
            _owners[i] = tokenIdToToken[_ids[i]].royaltyOwner;
        }

        return _owners;
    }

    function tokenRoyaltyFee(uint256 _id) external view override returns (uint256) {
        return tokenIdToToken[_id].royaltyFee;
    }

    function tokenRoyaltyFeeBatch(uint256[] calldata _ids) external view override returns (uint256[] memory) {
        uint256[] memory _fees = new uint256[](_ids.length);

        for (uint256 i = 0; i < _ids.length; ++i) {
            _fees[i] = tokenIdToToken[_ids[i]].royaltyFee;
        }

        return _fees;
    }

    function mint(
        uint256 _id,
        uint256 _tokenSupply,
        string calldata _uri,
        uint256 _royaltyFee
    ) external override inited {
        require(_id != 0, "New TokenID cannot be zero");
        require(_tokenSupply > 0, "New Token supply cannot be zero");
        require(tokenIdToToken[_id].tokenSupply == 0, "Cannot mint token with existing supply");
        require(
            tokenIdToToken[_id].tokenId == 0 || tokenIdToToken[_id].tokenId == _id,
            "Something is wrong with mint"
        );
        require(_royaltyFee <= RATE_BASE, "Fee rate error");

        if (tokenIdToToken[_id].tokenId == 0) {
            tokenIds.push(_id);
            tokenIdToToken[_id].tokenId = _id;
            tokenIdToToken[_id].tokenIndex = tokenIds.length.sub(1);
            tokenIdToToken[_id].royaltyOwner = msg.sender;
            emit RoyaltyOwner(msg.sender, _id);
        }

        tokenIdToToken[_id].tokenSupply = _tokenSupply;
        tokenIdToToken[_id].tokenUri = _uri;
        tokenIdToToken[_id].royaltyFee = _royaltyFee;
        emit RoyaltyFee(_royaltyFee, _id);

        _addTokenToOwner(_id, msg.sender);
        balances[_id][msg.sender] = _tokenSupply;
        emit TransferSingle(msg.sender, address(0x0), msg.sender, _id, _tokenSupply);

        if (bytes(_uri).length > 0) {
            emit URI(_uri, _id);
        }
    }

    function burn(uint256 _id, uint256 _value) external override inited {
        _burnFrom(msg.sender, _id, _value);
    }

    function burnFrom(
        address _owner,
        uint256 _id,
        uint256 _value
    ) external override inited {
        _burnFrom(_owner, _id, _value);
    }

    function _burnFrom(
        address _owner,
        uint256 _id,
        uint256 _value
    ) internal {
        require(_owner == msg.sender || operatorApproval[_owner][msg.sender] == true, "Burner is not operator");
        require(_value > 0, "Cannot burn zero token");
        balances[_id][_owner] = balances[_id][_owner].sub(_value);
        emit TransferSingle(msg.sender, msg.sender, address(0x0), _id, _value);
        if (balances[_id][_owner] <= 0) {
            _removeTokenFromOwner(_id, _owner);
        }

        tokenIdToToken[_id].tokenSupply = tokenIdToToken[_id].tokenSupply.sub(_value);
    }

    function tokenInfo(uint256 _id) external view override returns (TokenInfo memory) {
        return tokenIdToToken[_id];
    }

    function tokenInfoBatch(uint256[] calldata _ids) external view override returns (TokenInfo[] memory) {
        TokenInfo[] memory _tokens = new TokenInfo[](_ids.length);

        for (uint256 i = 0; i < _ids.length; ++i) {
            _tokens[i] = tokenIdToToken[_ids[i]];
        }

        return _tokens;
    }

    function decimals() external pure override returns (uint8) {
        return uint8(0);
    }
}