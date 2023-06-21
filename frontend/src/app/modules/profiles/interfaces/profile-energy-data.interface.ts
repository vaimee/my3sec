import { Observable } from 'rxjs';

export interface ProfileEnergyData {
  totalEnergyOf$: Observable<number>;
  totalEndorsing$: Observable<number>;
  receivedEnergyOf$: Observable<number>;
  totalEndorsers$: Observable<number>;
  freeEnergyOf$: Observable<number>;
}
