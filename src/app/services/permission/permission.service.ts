import { Injectable } from '@angular/core';
import {
  APP_USER,
  PERMISSION_RULES
} from '../../constants';

@Injectable()
export class PermissionService {

  private activeAppUser: any = {};

  public isAdmin(user) {
    return user.role === 'admin' || user.role === 'super';
  }

  public isMe(user) {
    this.getAuthorizedUser();
    return user.id === this.activeAppUser.id;
  }

  public isAllowedAction(action: string, entity: any) {
    this.getAuthorizedUser();
    return PERMISSION_RULES[this.activeAppUser.role] &&
      PERMISSION_RULES[this.activeAppUser.role][entity] ?
        PERMISSION_RULES[this.activeAppUser.role][entity][action] : false;
  }

  private getAuthorizedUser() {
    this.activeAppUser = localStorage.getItem(APP_USER) ?
      JSON.parse(atob(localStorage.getItem(APP_USER))) : '';
  }
}
