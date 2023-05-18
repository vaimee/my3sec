export const environment = {
  production: true,
  contracts: {
    my3secHub: '0x77402d077515FF23D23Fe101274ddF50cf0B1EfE',
    my3secToken: '0xd6432cbdbed62eC465dc00f8C80DD6E4e419966c',
    my3secProfiles: '0x56Eb89B30b811058717ff05d5c9EAd6EFDF57578',
    energyManager: '0xf486477789de90558CBC1bA83B4027182f3DEcd1',
  },
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
  abiPaths: {
    my3secHub: '../../../assets/contracts/my3sec-hub.abi.json',
  },
  ipfs: {
    httpGateway: 'https://ipfs.io/ipfs',
    api_key:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIwMmQ4OEViZmQwOTM5N2M5NUNDNkJFYTUxOTliMDYwZEQyQzZmNjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4Mzg4Nzc0NzQ0NCwibmFtZSI6Im15M3NlYyJ9.7ICKTPfgxcnBSblJQ_4ptfaQm82wLpgY4flozHkCKzs',
  },
};
