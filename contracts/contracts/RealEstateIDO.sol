// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RealEstateIDO
 * @dev A simplified real estate crowdfunding contract for Graso MVP
 * Allows users to create properties, contribute to campaigns, and withdraw funds
 */
contract RealEstateIDO {
    struct Property {
        uint256 id;
        string title;
        string description;
        string image;
        string propertyType;
        string longitude;
        string latitude;
        address creator;
        uint256 targetPrice;
        uint256 currentAmount;
        uint256 deadline;
        bool isActive;
        bool isSuccessful;
    }

    struct Contributor {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Contributor[]) public propertyContributors;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    // Events
    event PropertyCreated(
        uint256 indexed propertyId,
        address indexed creator,
        string title,
        uint256 targetPrice,
        uint256 deadline
    );

    event ContributionMade(
        uint256 indexed propertyId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        uint256 indexed propertyId,
        address indexed creator,
        uint256 amount
    );

    event CampaignFinalized(
        uint256 indexed propertyId,
        bool isSuccessful,
        uint256 totalRaised
    );

    // Modifiers
    modifier propertyExists(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Property does not exist");
        _;
    }

    modifier onlyCreator(uint256 _propertyId) {
        require(properties[_propertyId].creator == msg.sender, "Only creator can call this");
        _;
    }

    /**
     * @dev Create a new property listing
     */
    function createProperty(
        string memory _title,
        string memory _description,
        string memory _image,
        string memory _propertyType,
        uint256 _targetPrice,
        uint256 _deadline,
        string memory _longitude,
        string memory _latitude
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_targetPrice > 0, "Target price must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        propertyCount++;
        
        properties[propertyCount] = Property({
            id: propertyCount,
            title: _title,
            description: _description,
            image: _image,
            propertyType: _propertyType,
            longitude: _longitude,
            latitude: _latitude,
            creator: msg.sender,
            targetPrice: _targetPrice,
            currentAmount: 0,
            deadline: _deadline,
            isActive: true,
            isSuccessful: false
        });

        emit PropertyCreated(propertyCount, msg.sender, _title, _targetPrice, _deadline);
        
        return propertyCount;
    }

    /**
     * @dev Contribute to a property campaign
     */
    function contribute(uint256 _propertyId) external payable propertyExists(_propertyId) {
        Property storage property = properties[_propertyId];
        
        require(property.isActive, "Campaign is not active");
        require(block.timestamp < property.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        property.currentAmount += msg.value;
        contributions[_propertyId][msg.sender] += msg.value;

        propertyContributors[_propertyId].push(Contributor({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit ContributionMade(_propertyId, msg.sender, msg.value, block.timestamp);

        // Check if target reached
        if (property.currentAmount >= property.targetPrice) {
            property.isSuccessful = true;
        }
    }

    /**
     * @dev Withdraw funds (only creator, only if successful)
     */
    function withdraw(uint256 _propertyId) 
        external 
        propertyExists(_propertyId) 
        onlyCreator(_propertyId) 
    {
        Property storage property = properties[_propertyId];
        
        require(property.isActive, "Already withdrawn");
        require(
            property.isSuccessful || block.timestamp >= property.deadline,
            "Campaign still active"
        );

        uint256 amount = property.currentAmount;
        require(amount > 0, "No funds to withdraw");

        property.isActive = false;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_propertyId, msg.sender, amount);
    }

    /**
     * @dev Finalize a campaign (can be called by anyone after deadline)
     */
    function finalizeCampaign(uint256 _propertyId) external propertyExists(_propertyId) {
        Property storage property = properties[_propertyId];
        
        require(property.isActive, "Campaign already finalized");
        require(block.timestamp >= property.deadline, "Campaign not yet ended");

        property.isSuccessful = property.currentAmount >= property.targetPrice;
        
        emit CampaignFinalized(_propertyId, property.isSuccessful, property.currentAmount);
    }

    // ============ View Functions ============

    /**
     * @dev Get property info
     */
    function getPropertyInfo(uint256 _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Property memory) 
    {
        return properties[_propertyId];
    }

    /**
     * @dev Get all properties
     */
    function getAllProperties() external view returns (Property[] memory) {
        Property[] memory allProperties = new Property[](propertyCount);
        
        for (uint256 i = 1; i <= propertyCount; i++) {
            allProperties[i - 1] = properties[i];
        }
        
        return allProperties;
    }

    /**
     * @dev Get contributors for a property
     */
    function getContributors(uint256 _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Contributor[] memory) 
    {
        return propertyContributors[_propertyId];
    }

    /**
     * @dev Check if address is a contributor
     */
    function isContributor(uint256 _propertyId, address _address) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (bool) 
    {
        return contributions[_propertyId][_address] > 0;
    }

    /**
     * @dev Get contribution amount for an address
     */
    function getContribution(uint256 _propertyId, address _address) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (uint256) 
    {
        return contributions[_propertyId][_address];
    }
}
