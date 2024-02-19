import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss']
})
export class ImageLoaderComponent implements OnInit {

 
  @Input() imgSrc: string;

  loading: boolean = true;
  spinnerSrc: string;
  onLoad() {
    this.loading = false;
  }

  constructor() {
    this.spinnerSrc = 'assets/layout/images/oval.svg';
   }

  ngOnInit() { }

}