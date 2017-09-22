import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  APP_USER,
  GENDERS,
  DEFAULT_SUCCESS_MESSAGE,
  TABLE_UPDATE_TIMEOUT
} from '../../constants';
import { AppState } from '../../app.service';
import { AuthService, PermissionService, UserService } from '../../services/index';
//noinspection TypeScriptCheckImport
import * as _ from 'lodash';
import { USER_ROLES } from '../../constants';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'users',
  providers: [ PermissionService, UserService],
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit, OnDestroy {

  public localState = {value: ''};
  public loading: boolean = false;
  public genders: [object] = GENDERS;
  public allItems: any;
  public activeAppUser: any = JSON.parse(atob(localStorage.getItem(APP_USER)));

  // Sorting settings
  public sortBy: string = 'createdAt';
  public sortOrder: any = 'DESC';
  public filteredTotal: number = 0;
  public fromRow: number = 1;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public paginationSettings: string = '';
  public itemsOnPageSettings: [number] = [10, 20, 50];
  public searchStringObject: string = '';

  private getItemsInterval: any = setInterval(() => {
    this.getUsers();
  }, TABLE_UPDATE_TIMEOUT);

  constructor(
    public appState: AppState,
    private _auth: AuthService,
    private _userService: UserService,
    private _permission: PermissionService
  ) {}

  public ngOnInit() {
    if (!this._auth.getCurrentUser()) {
      this._auth.signOut();
    }
    this.isAllowedAction('view', 'user') ? this.getUsers() : this._auth.signOut();
  }

  public ngOnDestroy() {
    clearInterval(this.getItemsInterval);
  }

  public getUsers() {
    this.loading = true;
    this.updatePaginationSettings();
    return this._userService.getUsers(this.paginationSettings, this.searchStringObject)
      .subscribe(
        (users: any) => {
          this.allItems = _.orderBy(users.rows, [this.sortBy], [_.toLower(this.sortOrder)]);
          this.filteredTotal = users.count;
          this.loading = false;
        },
        (err: any) => { this._auth.checkAuth(err); }
      );
  }

  public deleteUser(userId) {
    console.log('userId: ', userId);
  }

  public submitState(value: string) {
    this.appState.set('value', value);
    this.localState.value = '';
  }

  /**
   * Pagination bar action function with paging params
   * @param pagingEvent
   */
  public page(pagingEvent: any): void {
    if (this.pageSize !== pagingEvent.pageSize) {
      const appSettings: any = localStorage.getItem('app_settings');
      const settings: any = appSettings ? JSON.parse(appSettings) : {};
      if (settings) {
        settings.pageSize = pagingEvent.pageSize;
        localStorage.setItem('app_settings', JSON.stringify(settings));
      }
    }
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.getUsers();
  }

  public showSnackBarSuccess() {
    console.log(DEFAULT_SUCCESS_MESSAGE);
  }

  public showSnackBarMessage(message: string) {
    console.log(message);
  }

  public isAllowedAction(actionName: string, entityName: string) {
    return this._permission.isAllowedAction(actionName, entityName);
  }

  public isMe(user: any) {
    return this._permission.isMe(user);
  }

  public getRoleViewValue(role) {
    return _.get(_.find(USER_ROLES, ['value', role]), 'viewValue');
  }

  public navigateTo(destination: any) {
    console.log('navigateTo: ', destination);
  }

  public search(searchText: string) {
    console.log('search: ', searchText);
    this.searchStringObject = searchText ? `{"firstName":"${searchText}","lastName":"${searchText}",` +
      `"email":"${searchText}","description":"${searchText}"}` : '';
    this.getUsers();
  }

  private updatePaginationSettings() {
    this.paginationSettings = `?page=${this.currentPage}` +
      `&limit=${this.pageSize}` +
      `&order={"${this.sortBy}":${this.sortOrder === 'ASC' ? 1 : -1}}`;
  }
}
