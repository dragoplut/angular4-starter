import { Injectable, Inject } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { UserComponent } from '../../pages/index';

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<any> {

  public canDeactivate(target: any) {
    if (target && target.hasChanges) {
      return window.confirm('Unsaved changes will be lost. Do you really want to leave page?');
    }
    return true;
  }
}
