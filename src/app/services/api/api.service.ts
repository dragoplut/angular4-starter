import { Injectable, OnInit } from '@angular/core';
import {
  Headers,
  Http,
  Response,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { JWT_KEY } from '../../constants';

@Injectable()
export class ApiService implements OnInit {

  public JWT_KEY: string = JWT_KEY;
  public headers: Headers = localStorage.getItem(this.JWT_KEY) ?
      new Headers({
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem(this.JWT_KEY)
    }) :
      new Headers({
      'Content-type': 'application/json'
    });

  protected endpoint: string = API_URL;

  private accessToken: string = localStorage.getItem(this.JWT_KEY);

  constructor(private http: Http) {}

  public ngOnInit() {
    this.accessToken = localStorage.getItem(this.JWT_KEY);
    if (this.accessToken && this.accessToken.length < 50) { this.accessToken = undefined; }
    if (this.accessToken) { this.setHeaders({Authorization: `Bearer ${this.accessToken}`}); }
  }

  public get(path: string): Observable<any> {
    this.setHeaders({Authorization: `Bearer ${localStorage.getItem(this.JWT_KEY)}`});
    return this.http.get(`${this.endpoint}${path}`, this.getDefaultOptions())
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public post(path, body): Observable<any> {
    this.setHeaders({Authorization: `Bearer ${localStorage.getItem(this.JWT_KEY)}`});
    return this.http.post(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public put(path: string, body: any): Observable<any> {
    return this.http.put(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public delete(path: string): Observable<any> {
    return this.http.delete(`${this.endpoint}${path}`, this.getDefaultOptions())
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public setHeaders(headers) {
     Object.keys(headers)
      .forEach((header: any) => this.headers.set(header, headers[header]));
  }

  protected getDefaultOptions(): RequestOptions {
    const headersWithToken = new Headers({
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem(this.JWT_KEY)
    });
    const headersWithoutToken = new Headers({
      'Content-type': 'application/json'
    });
    const headers = localStorage.getItem(this.JWT_KEY) ? headersWithToken : headersWithoutToken;

    return new RequestOptions({ headers });
  }

  private getJson(resp: Response) {
    return resp.json();
  }

  private checkForError(resp: Response): Response {
    if (resp.status >= 200 && resp.status < 300) {
      return resp;
    } else {
      const error = new Error(resp.statusText);
      error['response'] = resp;
      throw error;
    }
  }
}
