import { Observable, toArray } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';

import { Certificate } from '@shared/interfaces';
import { ProfileService } from '@shared/services/profile.service';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent implements OnInit {
  @Input() profileId!: number;
  certificates$!: Observable<Certificate[]>;

  constructor(private profileService: ProfileService) {}
  ngOnInit(): void {
    this.certificates$ = this.profileService.getCertificates(this.profileId).pipe(toArray());
  }
}
