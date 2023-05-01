import { Injectable } from '@angular/core';
import { ResponseConfigObject } from '../form/form.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  responseConfig: ResponseConfigObject = {
    computedAnnualPayouts: null,
    pending: false,
    dbErrorMessage: false,
    emptyFormWarning: false
  }

  responseEmitter = new Subject<ResponseConfigObject>();

  raiseEmitterEvent(data: ResponseConfigObject) {
    console.log('Caught by service!');
    console.log(data);
    this.responseEmitter.next(data)
  }

}
