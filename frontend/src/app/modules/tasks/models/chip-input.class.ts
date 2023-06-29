import { Observable, of } from 'rxjs';

export class ChipInput<T> {
  all: T[];
  items$: Observable<T[]>;
  filteredItems$: Observable<T[]>;
  selectedItems: T[];

  constructor() {
    this.all = [];
    this.items$ = of([]);
    this.filteredItems$ = of([]);
    this.selectedItems = [];
  }
}
