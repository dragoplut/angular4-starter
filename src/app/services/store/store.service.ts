import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/distinctUntilChanged';

export interface Note {
  color?: string;
  title: string;
  message: string;
  _id?: string | number;
  createDate?: string;
  updatedAt?: string;
  authorId?: any;
}

export interface User {
  _id?: string;
}

export interface State {
  notes: Note[];
  user: User;
}

const defaultState = {
  notes: [],
  user: {}
};

const _store = new BehaviorSubject<State>(defaultState);

@Injectable()
export class Store {
  public store: any = _store;

  public changes: any = this.store ? this.store.asObservable()
    .distinctUntilChanged() : {};

  public setState(state: State) {
    this.store.next(state);
  }

  public getState(): State {
    return this.store.value;
  }

  public purge() {
    this.store.next(defaultState);
  }
}
