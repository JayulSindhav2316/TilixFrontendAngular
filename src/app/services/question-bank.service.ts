import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {

  constructor(private http: HttpClient) { }

  public getAllQuestions(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/QuestionBank/GetAllQuestions/`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addQuestion(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/QuestionBank/AddQuestion`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public cloneQuestion(body): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/QuestionBank/CloneQuestion`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateQuestion(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/QuestionBank/UpdateQuestion`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteQuestion(questionId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/QuestionBank/DeleteQuestion/`+ questionId)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getQuestionsByEventId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/QuestionBank/GetQuestionsByEventId/`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getQuestionsBySessionId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/QuestionBank/GetQuestionsBySessionId/`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public linkQuestionsByEventId(params): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/QuestionBank/LinkQuestionsByEventId/`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Question Bank Service:'+ error);
    return throwError(error);
  }
}
