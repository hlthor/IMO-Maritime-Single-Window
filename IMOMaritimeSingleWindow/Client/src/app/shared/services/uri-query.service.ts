import { Injectable } from '@angular/core';
import { TokenQueryModel } from '../models/token-query-model';
import { Params } from '@angular/router';

@Injectable()
export class UriQueryService {

  constructor() { }

  getTokenQueryModel(queryParams: Params): TokenQueryModel {
    // console.log({hasProperties: this.hasProperties(queryParams)});
    if (this.hasProperties(queryParams) && !this.anyParamsNull(queryParams)) {
      return new TokenQueryModel(queryParams['userId'], queryParams['token']);
    }
    return null;
  }

  private anyParamsNull(queryParams: Params): boolean {
    return this.paramNull(queryParams.userId) && this.paramNull(queryParams.token);
  }
  private paramNull(param: any): boolean {
    return !param || param === '';
  }

  private hasProperties(queryParams: Params): boolean {
    /* console.log({
      'userId': queryParams['userId'],
      'token': queryParams['token']
    });
    console.log({
      'hasUserId': !!queryParams['userId'],
      'hasToken': !!queryParams['token']
    }); */
    return !!queryParams['userId'] && !!queryParams['token'];
  }

}
