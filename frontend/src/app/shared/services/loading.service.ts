import { BehaviorSubject, Observable, forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  activeRequests = 0;
  hide(): void {
    if (this.activeRequests - 1 >= 0) this.activeRequests--;
    if (this.activeRequests === 0) this.loadingSubject.next(false);
  }

  show(): void {
    if (this.activeRequests === 0) this.loadingSubject.next(true);
    this.activeRequests++;
  }

  waitForObservables(observables: Observable<unknown>[]): void {
    this.show();
    forkJoin(observables).subscribe({ next: () => this.hide(), error: () => this.hide() });
  }
}
