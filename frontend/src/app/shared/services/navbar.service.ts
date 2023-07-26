import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { MenuItem } from '@shared/interfaces/menu-item.interface';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private menuItems$: BehaviorSubject<MenuItem[]> = new BehaviorSubject<MenuItem[]>([]);
  private menuClicked$: Subject<MenuItem> = new Subject<MenuItem>();

  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$.asObservable();
  }

  setMenuItems(menuItems: MenuItem[]): void {
    this.menuItems$.next(menuItems);
  }

  fireMenuClickedEvent(menuItem: MenuItem): void {
    this.menuClicked$.next(menuItem);
  }

  getMenuClickedEvent(): Observable<MenuItem> {
    return this.menuClicked$.asObservable();
  }
}
