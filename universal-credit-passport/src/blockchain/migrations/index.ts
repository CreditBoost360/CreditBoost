// Define a simple interface for the deployer
interface Deployer {
  deploy: (contract: any) => Promise<any>;
}

// Define a simple interface for artifacts
interface Artifacts {
  require: (name: string) => any;
}

// Use a different name to avoid conflict
const contractArtifacts = {
  require: (name: string) => {
    return { deployed: () => Promise.resolve({}) };
  }
};

const CreditPassport = contractArtifacts.require('CreditPassport');

module.exports = function(deployer: Deployer) {
  deployer.deploy(CreditPassport)
    .then(() => {
      console.log('CreditPassport contract deployed successfully');
    })
    .catch((error) => {
      console.error('Error deploying CreditPassport contract:', error);
    });
};