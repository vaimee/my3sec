import { Observable } from "rxjs";

export interface ProfileEnergyData {
    totalEnergyOf$: Observable<number>;
    energizedBy$: Observable<number>;
    receivedEnergyOf$: Observable<number>;
    energizersOf$: Observable<number>;
    allocatedEnergyOf$: Observable<number>;
}
