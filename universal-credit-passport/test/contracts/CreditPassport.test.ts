import { expect } from "chai";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import * as fs from "fs";
import * as path from "path";

// Using Truffle for testing instead of Hardhat
const CreditPassport = artifacts.require("CreditPassport");

contract("CreditPassport", (accounts) => {
    const owner = accounts[0];
    const user = accounts[1];
    const unauthorizedUser = accounts[2];
    
    let creditPassportInstance: any;

    beforeEach(async () => {
        creditPassportInstance = await CreditPassport.new({ from: owner });
    });

    it("should deploy the contract", async () => {
        expect(creditPassportInstance.address).to.exist;
    });

    it("should allow users to create credit passport", async () => {
        const creditScore = 750;
        const transactionHistory = ["Loan payment", "Credit card payment"];

        await creditPassportInstance.createCreditPassport(
            creditScore, 
            transactionHistory, 
            { from: user }
        );

        const result = await creditPassportInstance.getCreditData(user);
        
        expect(Number(result[0])).to.equal(creditScore);
        expect(result[1]).to.deep.equal(transactionHistory);
    });

    it("should allow users to update credit score", async () => {
        const initialCreditScore = 750;
        const updatedCreditScore = 800;
        const transactionHistory = ["Loan payment", "Credit card payment"];

        await creditPassportInstance.createCreditPassport(
            initialCreditScore, 
            transactionHistory, 
            { from: user }
        );

        await creditPassportInstance.updateCreditScore(
            updatedCreditScore, 
            { from: user }
        );

        const result = await creditPassportInstance.getCreditData(user);
        
        expect(Number(result[0])).to.equal(updatedCreditScore);
    });

    it("should allow users to add transactions", async () => {
        const creditScore = 750;
        const initialTransactionHistory = ["Loan payment", "Credit card payment"];
        const newTransaction = "Mortgage payment";

        await creditPassportInstance.createCreditPassport(
            creditScore, 
            initialTransactionHistory, 
            { from: user }
        );

        await creditPassportInstance.addTransaction(
            newTransaction, 
            { from: user }
        );

        const result = await creditPassportInstance.getCreditData(user);
        const expectedTransactionHistory = [...initialTransactionHistory, newTransaction];
        
        expect(result[1]).to.deep.equal(expectedTransactionHistory);
    });

    it("should revert when trying to get credit data for non-existent user", async () => {
        try {
            await creditPassportInstance.getCreditData(unauthorizedUser);
            assert.fail("The transaction should have thrown an error");
        } catch (err: any) {
            expect(err.message).to.include("Credit Passport does not exist for this user");
        }
    });
});