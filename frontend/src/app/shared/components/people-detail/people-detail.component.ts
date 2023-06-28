import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ProfileMetadata } from '@shared/interfaces';

@Component({
  selector: 'app-people-detail',
  templateUrl: './people-detail.component.html',
  styleUrls: ['./people-detail.component.css'],
})
export class PeopleDetailComponent implements OnInit {
  @Input() label = 'members';
  @Input() people!: ProfileMetadata[];
  @Input() showAddPeopleIcon = false;
  @Output() add: EventEmitter<void> = new EventEmitter();
  peopleToShow!: ProfileMetadata[];

  ngOnInit(): void {
    if (this.people.length > 4) this.peopleToShow = this.people.slice(0, 4);
    else this.peopleToShow = this.people;
  }

  public addPerson() {
    this.add.emit();
  }
}
