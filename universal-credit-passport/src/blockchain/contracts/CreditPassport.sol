// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditPassport {
    struct CreditData {
        uint256 creditScore;
        string[] transactionHistory;
        address owner;
    }

    mapping(address => CreditData) private creditRecords;

    event CreditDataUpdated(address indexed user, uint256 creditScore, string[] transactionHistory);

    function createCreditPassport(uint256 _creditScore, string[] memory _transactionHistory) public {
        require(creditRecords[msg.sender].owner == address(0), "Credit Passport already exists for this user.");
        
        creditRecords[msg.sender] = CreditData({
            creditScore: _creditScore,
            transactionHistory: _transactionHistory,
            owner: msg.sender
        });

        emit CreditDataUpdated(msg.sender, _creditScore, _transactionHistory);
    }

    function updateCreditScore(uint256 _newCreditScore) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user.");
        
        creditRecords[msg.sender].creditScore = _newCreditScore;

        emit CreditDataUpdated(msg.sender, _newCreditScore, creditRecords[msg.sender].transactionHistory);
    }

    function addTransaction(string memory _transaction) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user.");
        
        creditRecords[msg.sender].transactionHistory.push(_transaction);

        emit CreditDataUpdated(msg.sender, creditRecords[msg.sender].creditScore, creditRecords[msg.sender].transactionHistory);
    }

    function getCreditData(address _user) public view returns (uint256, string[] memory) {
        require(creditRecords[_user].owner != address(0), "Credit Passport does not exist for this user.");
        
        CreditData memory data = creditRecords[_user];
        return (data.creditScore, data.transactionHistory);
    }
}