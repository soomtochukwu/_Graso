// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyToken
 * @dev Real estate tokenization with fractional ownership and yield distribution
 *
 * Features:
 * - ERC-20 tokens representing property shares
 * - Fixed supply per property
 * - KYC-gated access (only verified addresses can buy/claim)
 * - Yield distribution (rent) proportional to ownership
 * - Property metadata on-chain
 */
contract PropertyToken is ERC20, Ownable, ReentrancyGuard {
    // ============ Structs ============

    struct PropertyInfo {
        string title;
        string description;
        string location;
        string imageHash; // IPFS hash
        uint256 valuation; // Property value in MNT
        uint256 totalSupply; // Total ownership units
        uint256 pricePerToken; // Price per ownership unit
        uint256 yieldRate; // Annual yield rate (basis points, e.g., 800 = 8%)
        bool isActive;
    }

    struct YieldInfo {
        uint256 totalRentDeposited;
        uint256 totalRentClaimed;
        uint256 lastDistributionTime;
    }

    // ============ State Variables ============

    PropertyInfo public property;
    YieldInfo public yieldInfo;

    // KYC verification mapping
    mapping(address => bool) public isVerified;

    // Track yield claimed per user
    mapping(address => uint256) public yieldClaimed;

    // Track yield snapshot for fair distribution
    mapping(address => uint256) public lastYieldPerToken;
    uint256 public accumulatedYieldPerToken;

    // Custody tracking
    mapping(address => bool) public isPlatformCustody;
    uint256 public platformCustodyBalance;

    // Constants
    uint256 private constant PRECISION = 1e18;

    // ============ Events ============

    event PropertyCreated(
        string title,
        uint256 totalSupply,
        uint256 pricePerToken
    );
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RentDeposited(uint256 amount, uint256 timestamp);
    event YieldClaimed(address indexed user, uint256 amount);
    event UserVerified(address indexed user, bool status);
    event CustodyChanged(address indexed user, bool isPlatformCustody);

    // ============ Modifiers ============

    modifier onlyVerified() {
        require(isVerified[msg.sender], "KYC verification required");
        _;
    }

    modifier propertyActive() {
        require(property.isActive, "Property is not active");
        _;
    }

    // ============ Constructor ============

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _title,
        string memory _description,
        string memory _location,
        string memory _imageHash,
        uint256 _valuation,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        uint256 _yieldRate
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        property = PropertyInfo({
            title: _title,
            description: _description,
            location: _location,
            imageHash: _imageHash,
            valuation: _valuation,
            totalSupply: _totalSupply,
            pricePerToken: _pricePerToken,
            yieldRate: _yieldRate,
            isActive: true
        });

        // Mint all tokens to contract (available for purchase)
        _mint(address(this), _totalSupply);

        // Owner is automatically verified
        isVerified[msg.sender] = true;

        emit PropertyCreated(_title, _totalSupply, _pricePerToken);
    }

    // ============ Admin Functions ============

    /**
     * @dev Set KYC verification status for a user
     */
    function setVerified(address _user, bool _status) external onlyOwner {
        isVerified[_user] = _status;
        emit UserVerified(_user, _status);
    }

    /**
     * @dev Batch verify multiple users
     */
    function batchSetVerified(
        address[] calldata _users,
        bool _status
    ) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            isVerified[_users[i]] = _status;
            emit UserVerified(_users[i], _status);
        }
    }

    /**
     * @dev Deposit rent for yield distribution
     */
    function depositRent() external payable onlyOwner nonReentrant {
        require(msg.value > 0, "Must deposit some rent");

        uint256 circulatingSupply = property.totalSupply -
            balanceOf(address(this));
        require(circulatingSupply > 0, "No tokens in circulation");

        // Update accumulated yield per token
        accumulatedYieldPerToken += (msg.value * PRECISION) / circulatingSupply;

        yieldInfo.totalRentDeposited += msg.value;
        yieldInfo.lastDistributionTime = block.timestamp;

        emit RentDeposited(msg.value, block.timestamp);
    }

    /**
     * @dev Update property active status
     */
    function setPropertyActive(bool _isActive) external onlyOwner {
        property.isActive = _isActive;
    }

    /**
     * @dev Withdraw unsold tokens (emergency)
     */
    function withdrawUnsoldTokens(address _to) external onlyOwner {
        uint256 unsold = balanceOf(address(this));
        require(unsold > 0, "No unsold tokens");
        _transfer(address(this), _to, unsold);
    }

    // ============ User Functions (KYC Required) ============

    /**
     * @dev Purchase property tokens
     */
    function buyTokens(
        uint256 _amount
    ) external payable onlyVerified propertyActive nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(address(this)) >= _amount,
            "Not enough tokens available"
        );

        uint256 cost = _amount * property.pricePerToken;
        require(msg.value >= cost, "Insufficient payment");

        // Update yield tracking before transfer
        _updateYield(msg.sender);

        // Transfer tokens to buyer
        _transfer(address(this), msg.sender, _amount);

        // Refund excess payment
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - cost
            }("");
            require(success, "Refund failed");
        }

        emit TokensPurchased(msg.sender, _amount, cost);
    }

    /**
     * @dev Claim accumulated yield
     */
    function claimYield() external onlyVerified nonReentrant {
        _updateYield(msg.sender);

        uint256 owed = _pendingYield(msg.sender);
        require(owed > 0, "No yield to claim");

        yieldClaimed[msg.sender] += owed;
        yieldInfo.totalRentClaimed += owed;

        (bool success, ) = payable(msg.sender).call{value: owed}("");
        require(success, "Yield transfer failed");

        emit YieldClaimed(msg.sender, owed);
    }

    /**
     * @dev Stake tokens to platform custody (for enhanced yield or features)
     */
    function stakeToPlatform(
        uint256 _amount
    ) external onlyVerified nonReentrant {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(!isPlatformCustody[msg.sender], "Already in platform custody");

        _updateYield(msg.sender);

        // Transfer to contract (platform custody)
        _transfer(msg.sender, address(this), _amount);
        platformCustodyBalance += _amount;
        isPlatformCustody[msg.sender] = true;

        emit CustodyChanged(msg.sender, true);
    }

    /**
     * @dev Withdraw from platform custody back to self-custody
     */
    function withdrawFromPlatform(
        uint256 _amount
    ) external onlyVerified nonReentrant {
        require(isPlatformCustody[msg.sender], "Not in platform custody");
        require(
            platformCustodyBalance >= _amount,
            "Insufficient platform balance"
        );

        _updateYield(msg.sender);

        platformCustodyBalance -= _amount;
        _transfer(address(this), msg.sender, _amount);

        if (balanceOf(msg.sender) == 0) {
            isPlatformCustody[msg.sender] = false;
        }

        emit CustodyChanged(msg.sender, false);
    }

    // ============ View Functions ============

    /**
     * @dev Get property information
     */
    function getPropertyInfo() external view returns (PropertyInfo memory) {
        return property;
    }

    /**
     * @dev Get yield owed to a user
     */
    function getYieldOwed(address _user) external view returns (uint256) {
        if (balanceOf(_user) == 0) return 0;

        uint256 pendingPerToken = accumulatedYieldPerToken -
            lastYieldPerToken[_user];
        return (balanceOf(_user) * pendingPerToken) / PRECISION;
    }

    /**
     * @dev Get total yield claimed by user
     */
    function getTotalYieldClaimed(
        address _user
    ) external view returns (uint256) {
        return yieldClaimed[_user];
    }

    /**
     * @dev Get available tokens for purchase
     */
    function getAvailableTokens() external view returns (uint256) {
        return balanceOf(address(this)) - platformCustodyBalance;
    }

    /**
     * @dev Get user's ownership percentage (basis points)
     */
    function getOwnershipPercentage(
        address _user
    ) external view returns (uint256) {
        if (property.totalSupply == 0) return 0;
        return (balanceOf(_user) * 10000) / property.totalSupply;
    }

    /**
     * @dev Get custody status for user
     */
    function getCustodyStatus(
        address _user
    ) external view returns (string memory) {
        if (balanceOf(_user) == 0 && !isPlatformCustody[_user]) {
            return "none";
        }
        return isPlatformCustody[_user] ? "platform" : "self";
    }

    /**
     * @dev Check if user is verified for KYC
     */
    function isUserVerified(address _user) external view returns (bool) {
        return isVerified[_user];
    }

    // ============ Internal Functions ============

    function _updateYield(address _user) internal {
        lastYieldPerToken[_user] = accumulatedYieldPerToken;
    }

    function _pendingYield(address _user) internal view returns (uint256) {
        if (balanceOf(_user) == 0) return 0;

        uint256 pendingPerToken = accumulatedYieldPerToken -
            lastYieldPerToken[_user];
        return (balanceOf(_user) * pendingPerToken) / PRECISION;
    }

    // Override transfer to update yield tracking
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (from != address(0) && from != address(this)) {
            _updateYield(from);
        }
        if (to != address(0) && to != address(this)) {
            _updateYield(to);
        }
        super._update(from, to, value);
    }
}
