import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PermissionService } from '../../services/index';
import { PAGES_LIST } from '../../constants';
// tslint:disable-next-line
import * as _ from 'lodash';

@Component({
  selector: 'tool-bar',
  styleUrls: [ `./tool-bar.component.scss` ],
  templateUrl: `./tool-bar.component.html`,
})
export class ToolBarComponent implements OnInit, OnDestroy {

  public currentUser: any = this._auth.getCurrentUser();
  public errorImageSrc: string = '';
  public pagesList: any = PAGES_LIST;
  public pagesTitle: string = '';

  //private subscriber: any;

  constructor(
    private router: Router,
    private _auth: AuthService,
    private _permission: PermissionService
  ) {}

  public ngOnInit() {
    this.currentUser = this._auth.getCurrentUser();
    if (!this.currentUser) {
      this._auth.signOut();
    }
    //this.subscriber = this.router.events.subscribe((params: any) => {
    //  const routerUrl: any = this.router.url;
    //  const routeName: string = routerUrl.match(/\/([a-zA-Z0-9]{0,})/);
    //  this.pagesTitle = _.toUpper(routeName[1]);
    //});
  }

  public ngOnDestroy() {
    //this.subscriber.unsubscribe();
  }

  public signOut() {
    this._auth.signOut();
    this.router.navigate(['', 'signin']);
  }

  public isAllowedAction(actionName: string, entityName: string) {
    return this._permission.isAllowedAction(actionName, entityName);
  }

  public goBack() {
    for (const page of this.pagesList) {
      if (this._permission.isAllowedAction('view', page.permissionRef)) {
        this.router.navigate(page.routerLink);
        break;
      }
    }
  }
}
