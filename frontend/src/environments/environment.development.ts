export const environment = {
  production: false,
  contracts: {
    my3secHub: '0x9b5DeBB900500e53c726fd2Bd987eCa6A949Bc65',
    my3secToken: '0xfE50adc24fF6327B70b3abe8F82b8284d5F104F9',
    my3secProfiles: '0xDcC3375F38d4a9d11bB771Ba72073C4e4A52d9F8',
    energyWallet: '0x13Df2BbAd5B3bEfFdEe3fbB0e1f2D393990426fb',
    timeWallet: '0x0994B7a15E8431d4e45f731919D562F9Fc4Ad6eA',
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
    energyManager: '../../../assets/contracts/my3sec-energy-manager.abi.json',
  },
  ipfs: {
    httpGateway: 'https://ipfs.io/ipfs',
    api_key:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIwMmQ4OEViZmQwOTM5N2M5NUNDNkJFYTUxOTliMDYwZEQyQzZmNjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4Mzg4Nzc0NzQ0NCwibmFtZSI6Im15M3NlYyJ9.7ICKTPfgxcnBSblJQ_4ptfaQm82wLpgY4flozHkCKzs',
  },
};
