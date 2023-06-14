import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  activeRequests = 0;
  hide(): void {
    this.activeRequests--;
    console.log('show', this.activeRequests);
    if (this.activeRequests === 0) this.loadingSubject.next(false);
  }

  show(): void {
    
    
    if (this.activeRequests === 0) this.loadingSubject.next(true);
    this.activeRequests++;
    console.log('show', this.activeRequests);
  }
}
