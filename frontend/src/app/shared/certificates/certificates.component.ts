/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certificateData: any = [];
  constructor() { }

  ngOnInit(): void {
    this.certificateData = [
      {
        label: 'video_label',
        course: 'Computer Scientist',
        achievement: 'Hour based Achievement',
        date: '04/04/2023',
      },
      {
        label: 'video_label',
        course: 'Computer Scientist',
        achievement: 'Hour based Achievement',
        date: '04/04/2023',
      },
      {
        label: 'video_label',
        course: 'Computer Scientist',
        achievement: 'Hour based Achievement',
        date: '04/04/2023',
      }
    ];
  }

}
