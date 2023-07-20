import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileService } from '@shared/services/profile.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  profileExists$!: Observable<boolean>;
  constructor(private profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    this.profileExists$ = this.profileService.doesUserProfileExist();
  }

  redirectToProfile() {
    this.router.navigate(['/profiles']);
  }
}
