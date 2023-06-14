import { environment } from 'environments/environment.development';
import { NFTStorage } from 'nft.storage';
import { Observable, from } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class IpfsService {
  private NFT_STORAGE_KEY = environment.ipfs.api_key as string;

  private httpGateway = environment.ipfs.httpGateway;
  private nftstorage!: NFTStorage;

  constructor(private http: HttpClient, private loading: LoadingService) {
    this.nftstorage = new NFTStorage({ token: this.NFT_STORAGE_KEY });
  }

  storeJSON(json: unknown): Observable<string> {
    this.loading.show();
    const content = new Blob([JSON.stringify(json)]);
    return from(this.nftstorage.storeBlob(content)).pipe(
      finalize(() => {
        this.loading.hide();
      })
    );
  }

  retrieveJSON<T>(cid: string): Observable<T> {
    return this.http.get<T>(`${this.httpGateway}/${cid}`).pipe(
      map(response => {
        return response;
      })
    );
  }
}
