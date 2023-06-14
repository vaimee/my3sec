import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NgZone } from '@angular/core';

import detectEthereumProvider from '@metamask/detect-provider';

import { LoadingService } from '../../shared/services/loading.service';
import { AccountsChangedEvent } from './../../shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class MetamaskService {
  private _ethProvider: any;
  private _userAddress!: string;
  private _chain = environment.chain;
  // Connection flags:
  private _isMetamaskInstalled = false;
  private _isLoggedIn = false;

  private _isVivianiChain = false; //new

  // Promises and observables:
  private IS_READY!: Promise<void>;
  private ACCOUNTS_CHANGED!: Subject<AccountsChangedEvent>;
  static metamaskId: any;

  constructor(private ngZone: NgZone, private loadingService: LoadingService) {
    this.ACCOUNTS_CHANGED = new Subject<AccountsChangedEvent>();
    this.loadingService.show();
    // eslint-disable-next-line no-async-promise-executor
    this.IS_READY = new Promise<void>(async (resolve, reject) => {
      try {
        await this.init();
        this.loadingService.hide();
        resolve();
      } catch (error) {
        this.loadingService.hide();
        reject(error);
      }
    });
  }

  public get userAddress(): string {
    return this._userAddress;
  }

  // Connection flags:
  public get isLoggedIn() {
    return this._isLoggedIn;
  }

  public get isMetamaskInstalled() {
    return this._isMetamaskInstalled;
  }

  public get isVivianiChain() {
    return this._isVivianiChain;
  }

  // Promises and observables:
  public get isReady(): Promise<void> {
    return this.IS_READY;
  }

  public get accountsChanged(): Observable<AccountsChangedEvent> {
    return this.ACCOUNTS_CHANGED.asObservable();
  }

  private async init(): Promise<void> {
    try {
      this._ethProvider = await this.getEthereumProvider();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this._ethProvider.on('chainChanged', (_chainId: number) => window.location.reload());
      this._ethProvider.on('accountsChanged', (accounts: Array<string>) =>
        this.ngZone.run(async () => {
          // Bring event back inside Angular's zone
          await this.handleAccountsChanged(accounts);
        })
      );

      // Set flag isMetamaskInstalled:
      this._isMetamaskInstalled = true;

      // Set flag isLoggedIn:
      const accounts = await this._ethProvider.request({
        method: 'eth_accounts',
      });
      this._isLoggedIn = accounts.length > 0;
      if (this._isLoggedIn) {
        this._userAddress = accounts[0];
      }

      // Set flag isVivianiChain:
      const chainId: string = await this._ethProvider.request({
        method: 'eth_chainId',
      });
      this._isVivianiChain = chainId === this._chain.chainId;
    } catch {
      this._isMetamaskInstalled = false;
      this._isLoggedIn = false;
      this._isVivianiChain = false;
    }
  }

  private async handleAccountsChanged(accounts: Array<string>): Promise<void> {
    await this.isReady;

    this._isLoggedIn = accounts.length > 0;
    if (!this._isLoggedIn) {
      // The user disconnected from Metamask:
      // reload the page to restart from scratch.
      window.location.reload();
      return;
    }

    // Update the user address and emit the event:
    this.ACCOUNTS_CHANGED.next({
      oldValue: this._userAddress,
      newValue: accounts[0],
    });
    this._userAddress = accounts[0];
  }

  public async loginToMetamask(): Promise<void> {
    this.loadingService.show();
    await this._ethProvider.request({ method: 'eth_requestAccounts' });
    this.loadingService.hide();
  }

  public async switchToVivianiChain(): Promise<void> {
    this.loadingService.show();
    await this._ethProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: this._chain.chainId }],
    });
    const chainId: string = await this._ethProvider.request({
      method: 'eth_chainId',
    });
    this._isVivianiChain = chainId === this._chain.chainId;
    this.loadingService.hide();
  }

  public async addVivianiChain(): Promise<void> {
    this.loadingService.show();
    await this._ethProvider.request({
      method: 'wallet_addEthereumChain',
      params: [this._chain],
    });
    this.loadingService.hide();
  }

  private async getEthereumProvider(): Promise<unknown> {
    const provider: unknown = await detectEthereumProvider({
      mustBeMetaMask: true,
      silent: false,
      timeout: 3000,
    });
    return provider;
  }
}
