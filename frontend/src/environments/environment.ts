import * as contractsAddresses from '@vaimee/my3sec-contracts/deployed.json';

export const environment = {
  production: true,
  contracts: contractsAddresses,
  chain: {
    rpcUrls: ['https://bellecour.iex.ec'],
    chainName: 'bellecour',
    chainId: '0x86',
    blockExplorerUrls: ['https://blockscout-bellecour.iex.ec/'],
    nativeCurrency: {
      symbol: 'RLC',
      decimals: 18,
    },
  },
  ipfs: {
    httpGateway: 'https://ipfs.io/ipfs',
    api_key:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIwMmQ4OEViZmQwOTM5N2M5NUNDNkJFYTUxOTliMDYwZEQyQzZmNjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4Mzg4Nzc0NzQ0NCwibmFtZSI6Im15M3NlYyJ9.7ICKTPfgxcnBSblJQ_4ptfaQm82wLpgY4flozHkCKzs',
  },
};
