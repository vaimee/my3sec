import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { NFTStorage } from 'nft.storage';
import { LoadingService } from './loading.service';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class IpfsService {
  private NFT_STORAGE_KEY = environment.ipfs.api_key;

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

  retrieveJSON(cid: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.httpGateway}/${cid}`).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
