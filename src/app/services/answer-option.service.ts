import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswerOptionService {

  constructor(private http: HttpClient) { }

  public getAnswerOptionsByQuestionBankId(questionBankId): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/AnswerOption/GetAnswerOptionsByQuestionBankId?questionBankId=` + questionBankId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addAnswerOption(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AnswerOption/AddAnswerOption`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateAnswerOption(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AnswerOption/UpdateAnswerOption`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteAnswerOption(answerOptionId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/AnswerOption/DeleteAnswerOption/`+ answerOptionId)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  public getAnswerOptionById(answerOptionId): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/AnswerOption/GetAnswerOptionById?answerOptionId=` + answerOptionId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  async getAnswerOptionByIdAsync(answerOptionId)
  {
    return await this.http.get<any>(`${environment.baseApiUrl}/AnswerOption/GetAnswerOptionById?answerOptionId=` + answerOptionId).toPromise();
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Question Bank Service:'+ error);
    return throwError(error);
  }
}
