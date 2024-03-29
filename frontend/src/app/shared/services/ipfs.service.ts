import { environment } from 'environments/environment.development';
import { NFTStorage } from 'nft.storage';
import { Observable, from } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Skill } from '@profiles/interfaces';

import { LoadingService } from './loading.service';

//TODO: type the skill Ontology
type skillOntology = any;

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

  public storeJSON(json: unknown): Observable<string> {
    this.loading.show();
    const content = new Blob([JSON.stringify(json)]);
    return from(this.nftstorage.storeBlob(content)).pipe(
      finalize(() => {
        this.loading.hide();
      })
    );
  }

  public retrieveJSON<T>(cid: string): Observable<T> {
    return this.http.get<T>(`${this.httpGateway}/${cid}`);
  }

  public retrieveSkill(id: number, uri: string): Observable<Skill> {
    return this.http
      .get<skillOntology>(`${this.httpGateway}/${uri}`)
      .pipe(map(response => this.parseSkill(id, response)));
  }

  private parseSkill(id: number, incomingSkill: skillOntology): Skill {
    const skill: Skill = {
      id: id,
      name: incomingSkill.title as string,
      description: incomingSkill.description.en.literal as string,
      category: '',
    };
    if (incomingSkill.links?.broaderHierarchyConcept)
      skill.category = incomingSkill.links?.broaderHierarchyConcept[0]?.title;
    else if (incomingSkill.links?.broaderConcept) skill.category = incomingSkill.links?.broaderConcept[0]?.title;
    else skill.category = 'No broader concept linked';
    return skill;
  }
}
