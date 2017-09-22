import { Injectable } from '@angular/core';
import { ApiService, StoreHelper } from '../index';
import { Observable } from 'rxjs/Observable';
import { APP_USER } from '../../constants';
import 'rxjs/add/operator/do';
//noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class UserService {
  public path: string = '/user';
  public userPropsAllowed: [string] = [
    'address',
    'firstName',
    'lastName',
    'companyName',
    'username',
    'email',
    'gender',
    'dob',
    'description',
    'role',
    'status',
    'password',
  ];

  constructor(
    private api: ApiService,
    private storeHelper: StoreHelper
  ) {}

  public createUser(newUser: any): Observable<any> {
    const user = _.pick(newUser, this.userPropsAllowed);
    return this.api.post(this.path, user)
      .do((savedUser: any) => this.storeHelper.add('user', savedUser.data));
  }

  public updateUser(user: any): Observable<any> {
    const userData = _.pick(user, this.userPropsAllowed);
    const isProfile: boolean = location.pathname.indexOf('profile') !== -1;
    if (isProfile) {
      return this.api.put('/account', userData)
        .do((updatedUser: any) =>
          localStorage.setItem(APP_USER, btoa(JSON.stringify(updatedUser.data)))
          );
    } else {
      return this.api.put(this.path + '/' + user.id, userData)
        .do((updatedUser: any) =>
          this.storeHelper.add(
            'user',
            updatedUser && updatedUser.data ? updatedUser.data : updatedUser
          )
        );
    }
  }

  public getUsers(paginationSettings: string, withSearch?: any): Observable<any> {
    const searchParam: string = withSearch ? '&search=' + withSearch : '';
    return this.api.get(`${this.path}/${paginationSettings}${searchParam}`);
  }

  public getOneUser(userId: any): Observable<any> {
    const includeParam: string = '';
    const id: string = userId && userId === 'profile' ? '' : '/' + userId;
    const path: string = userId && userId === 'profile' ? '/account' : this.path;
    return this.api.get(`${path}${id}${includeParam}`);
  }

  public removeUser(id: any): Observable<any> {
    return this.api.delete(this.path + '/' + id);
  }
}
