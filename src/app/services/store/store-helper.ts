import { Injectable } from '@angular/core';
import { Store } from './store.service';
@Injectable()
export class StoreHelper {
  constructor(private store: Store) {}
  public update(prop, state) {
    const currentState = this.store.getState();
    this.store.setState(Object.assign({}, currentState, { [prop]: state }));
  }
  public add(prop, state) {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    this.store.setState(Object.assign({}, currentState, { [prop]: [state, ...collection] }));
  }
  public findAndUpdate(prop, state) {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    this.store.setState(Object.assign({}, currentState, {[prop]: collection.map((item: any) => {
      if (item._id !== state._id) {
        return item;
      }
      return Object.assign({}, item, state);
    })}));
  }
  public findAndDelete(prop, _id) {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    this.store.setState(
      Object.assign({},
      currentState,
      {[prop]: collection.filter((item: any) => item._id !== _id)}
    ));
  }
}
