import { Component, OnInit } from '@angular/core';
import { Certificate } from 'app/user-profile/models';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent implements OnInit {
  certificatesData: Array<Certificate> = [];

  ngOnInit(): void {
    this.certificatesData = [
      {
        icon: 'video_label',
        name: 'Computer Scientist',
        achievement: 'Hour-based achievement',
        date: new Date('2022-12-17'),
      },
      {
        icon: 'video_label',
        name: 'Computer Scientist',
        achievement: 'Hour-based achievement',
        date: new Date('2023-01-07'),
      },
      {
        icon: 'video_label',
        name: 'Computer Scientist',
        achievement: 'Hour-based achievement',
        date: new Date('2022-07-08'),
      },
    ];
  }
}
