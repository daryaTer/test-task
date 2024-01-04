import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;
  private readonly developerName = 'DT';

  constructor(private http: HttpClient) { }

  get(endpoint: string, params?: any): Observable<any> {
    const httpParams = new HttpParams({ fromObject: { ...params, developer: this.developerName } });
    return this.http.get(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  post(endpoint: string, body: any): Observable<any> {
    const httpParams = new HttpParams().append('developer', this.developerName);
    return this.http.post(`${this.baseUrl}/${endpoint}`, body, { params: httpParams });
  }

  postWithTokenRequired(endpoint: string, formData: FormData): Observable<any> {
    let params = new HttpParams();
      params = params.set('developer', this.developerName);

      const headers = new HttpHeaders();
      headers.set('crossDomain', 'true');
      headers.set('mimeType', 'multipart/form-data')
  
    return this.http.post(`${this.baseUrl}/${endpoint}`, formData,  { headers, params } );
  }
}
