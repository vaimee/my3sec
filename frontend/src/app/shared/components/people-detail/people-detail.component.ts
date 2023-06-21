import { Component, Input, OnInit } from '@angular/core';

import { ProfileMetadata } from '@shared/interfaces';

@Component({
  selector: 'app-people-detail',
  templateUrl: './people-detail.component.html',
  styleUrls: ['./people-detail.component.css'],
})
export class PeopleDetailComponent implements OnInit {
  @Input() label: string = 'members';
  @Input() people!: ProfileMetadata[];
  @Input() showAddPeopleIcon = true;
  peopleToShow!: ProfileMetadata[];

  ngOnInit(): void {
    if (this.people.length > 4) this.peopleToShow = this.people.slice(0, 4);
    else this.peopleToShow = this.people;
  }
}
