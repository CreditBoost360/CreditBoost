declare module 'truffle' {
  interface Artifacts {
    require(name: string): any;
  }

  interface Deployer {
    deploy(contract: any, ...args: any[]): Promise<any>;
    link(library: any, destinations: any): Promise<any>;
    then(fn: () => void): Promise<any>;
  }

  interface Contract {
    deployed(): Promise<any>;
    at(address: string): Promise<any>;
    new(...args: any[]): Promise<any>;
  }

  global {
    const artifacts: Artifacts;
    function contract(name: string, callback: (accounts: string[]) => void): void;
  }
}