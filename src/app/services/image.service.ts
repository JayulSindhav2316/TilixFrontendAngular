import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class ImageService {

  baseUrl: string;
  imageUrl: string;

  constructor(private httpClient: HttpClient) {

    /*this.baseUrl =  FourDInterface.fourDUrl + '/4DACTION/WebsGetImage/Person/';*/
   }

  getImage(personId: number): Observable<Blob> {
    const now = new Date();
    const nowIso = now.toISOString();
    const currentTime = Date.parse(nowIso);
    this.imageUrl  = this.baseUrl + personId +  '/NoCache' + currentTime;
    console.log('Image Url:' + this.imageUrl );
    return this.httpClient.get(this.imageUrl, { responseType: 'blob' });
  }

}