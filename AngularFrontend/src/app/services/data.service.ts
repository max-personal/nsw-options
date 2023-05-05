import { Injectable } from '@angular/core';
import { ResponseConfigObject } from '../form/form.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  responseConfig: ResponseConfigObject = null;

  responseEmitter = new Subject<ResponseConfigObject>();

  raiseEmitterEvent(data: ResponseConfigObject) {
    this.responseEmitter.next(data)
  }

  displayModeEmitter = new Subject<string>();

  raiseDisplayModeEvent(data: string) {
    this.displayModeEmitter.next(data)
  }

  priceMessageEmitter = new Subject<string>();

  raisePriceMessageEvent(data: string) {
    this.priceMessageEmitter.next(data)
  }


}
