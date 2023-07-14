import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Profile } from '@shared/interfaces';
import { ProfileService } from '@shared/services/profile.service';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css'],
})
export class ProfileListComponent implements OnInit {
  profiles$!: Observable<Profile[]>;

  constructor(private router: Router, private profileService: ProfileService) {}
  ngOnInit(): void {
    this.profiles$ = this.profileService.getProfiles();
  }

  goTo(id: string): void {
    this.router.navigate([`/profiles/${id}`]);
  }
}
