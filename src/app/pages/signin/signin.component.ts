import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ApiService, PermissionService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  PAGES_LIST,
  JWT_KEY
} from '../../constants';

@Component({
  selector: 'signin',
  styleUrls: [ `./signin.component.scss` ],
  templateUrl: `./signin.component.html`,
  providers: [ AuthService, ApiService ]
})
export class SigninComponent implements OnInit {

  public localState: any;
  public user: any = {
    email: '',
    password: ''
  };
  public linkText: string = 'Want to be a Partner?';
  public loading: boolean = false;
  public isAuthErr: boolean = false;
  public errorMessage: any = '';

  private PAGES_LIST: any = PAGES_LIST;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private _auth: AuthService,
    private _api: ApiService,
    private _permission: PermissionService
  ) {}

  public ngOnInit() {
    this._api.setHeaders({});
    console.log('ENV: ', ENV);
  }

  public authenticate() {
    this.makeAuth();
  }

  public goToReset() {
    this.router.navigate(['reset']);
  }

  public clearError() {
    this.errorMessage = '';
  }

  public showErrorMessage(message?: string) {
    console.log(message ? message : DEFAULT_ERROR_MESSAGE);
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  private makeAuth() {
    localStorage.removeItem(JWT_KEY);
    this.loading = true;
    this._api.setHeaders({});
    this._auth.authenticate('signin', this.user)
      .subscribe(
        (resp: any) => {
          this.loading = false;
          if (this._permission.isAllowedAction('view', 'signin')) {
            for (const page of this.PAGES_LIST) {
              if (this._permission.isAllowedAction('view', page.permissionRef)) {
                this.router.navigate(page.routerLink);
                break;
              }
            }
          } else {
            this._auth.signOut();
            const message: string = 'You are not allowed to sign in!';
            this.showErrorMessage(message);
          }
          return resp;
        },
        (err: any) => {
          this.loading = false;
          if (err && err.status && err.status > 304) { this.isAuthErr = true; }
          const message = JSON.parse(err._body);
          this.showErrorMessage(message.error.message);
          return JSON.parse(err._body);
        }
      );
  }
}
