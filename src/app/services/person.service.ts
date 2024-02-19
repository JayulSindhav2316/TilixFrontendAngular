import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private http: HttpClient) { }

  public getPersons(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersons`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getPersonsSearchHistory(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetSearchHistory`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPersonsByFirstAndLastName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByFirstNameAndLastName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPersonsByEmail(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByEmail`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPersonsByPhone(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByPhoneNumber`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPersonById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetPersonById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPrimaryAddressByPersonId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetPrimaryAddressByPersonId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getCreditBalanceById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/getCreditBalanceById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  

  public createPerson(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Person/CreatePerson`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updatePerson(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Person/updatePerson`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
 

  public deletePerson(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Person/DeletePerson`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public deleteSearchHistory(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Person/DeleteSearchHistory`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public terminateMembership(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Membership/TerminateMembership`, body)
      .pipe(
      catchError(this.handleError)
      );
  }

  public getAllPersonsByMembershipId(body): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByMembershipId`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  
  

  public getPreferredContactList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetPreferredContact`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getRelationshipTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Relationship/GetRelationshipSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public updateRelationship(params): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Relation/UpdateRelation`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public deleteRelationship(params): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Relation/DeleteRelation`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getPeopleByQucikSearch(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByQuickSearch`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getAllPersonsByName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPersonsByName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPeopleByCompanyId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetPeopleListByCompanyId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getAllPeopleList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Person/GetAllPeopleList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('personService:'+ error);
    return throwError(error);
  }
}

