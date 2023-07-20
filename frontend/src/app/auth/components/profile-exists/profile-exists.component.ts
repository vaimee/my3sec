import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-exists',
  templateUrl: './profile-exists.component.html',
  styleUrls: ['./profile-exists.component.css'],
})
export class ProfileExistsComponent {
  constructor(private router: Router) {}
  goToProfile() {
    this.router.navigate(['/']);
  }
}
