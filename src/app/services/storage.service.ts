import { Injectable } from '@angular/core';

export const Config = {
  Basic: {
    language: 'en', // this could be an environment variable, or setup in a config service externally
  },
  Storage: {
    Key: 'trilix',
    Timeout: 168, // a week
    ResetKey: '20220606', // yyyymmdd is best option
  },
};


interface IStorage {
  value: any;
  expiresin: number;
  timestamp: number;
}
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {
    // find out if storage needs to be forcefully nulled
    this._setResetKey();
  }

  private get ourStorage(): Storage {
    return localStorage;
  }
  private _setResetKey(): void {
    // NOTE here, if you are getting configuration externally, and to avoid any
    // mishaps, subscribe to the config$ observable here, just in case
    // the storageService is injected too early

    const _key = this.getKey(Config.Storage.ResetKey);
    const _reset: any = this.ourStorage.getItem(_key);

    // if it does not exist, it must have changed in config, remove everything
    if (!_reset || _reset !== 'true') {
      this.clear();
      // set a new one
      this.ourStorage.setItem(_key, 'true');
    }
  }

  private getKey(key: string, withLanguage = false): string {
    return `${Config.Storage.Key}${
      withLanguage ? '.' + Config.Basic.language : ''
    }.${key}`;
  }

  setItem(
    key: string,
    value: any,
    expiresin: number = Config.Storage.Timeout,
    withLanguage = false
  ) {
    // prepare value
    const _value: IStorage = {
      value,
      timestamp: Date.now(), // in milliseconds
      expiresin: expiresin, // in hours
    };

    // objects must be strings
    this.ourStorage.setItem(
      this.getKey(key, withLanguage),
      JSON.stringify(_value)
    );
  }

  getItem(key: string, withLanguage = false): any {
    // check value
    const _key = this.getKey(key, withLanguage);
    const value: any = this.ourStorage.getItem(_key);

    if (!value) {
      return null;
    }
    // cast
    const _value: IStorage = JSON.parse(value);

    // calculate expiration, expiresin is in hours, so convert to milliseconds
    if (Date.now() - _value.timestamp > _value.expiresin * 3_600_000) {
      // if expired, remove
      this.ourStorage.removeItem(_key);
      return null;
    }
    // return the value
    return _value.value;
  }

  removeItem(key: string, withLanguage = false) {
    this.ourStorage.removeItem(this.getKey(key, withLanguage));
  }

  // for caching language specific, prefix with language
  setCache(
    key: string,
    value: any,
    expiresIn: number = Config.Storage.Timeout
  ) {
    this.setItem(key, value, expiresIn, true);
  }
  getCache(key: string): any {
    return this.getItem(key, true);
  }
  removeCache(key: string) {
    this.removeItem(key, true);
  }

  clear(): void {
    // remove all prefixed items
    const toClear = [];

    for (let i = 0; i < this.ourStorage.length; i++) {
      const name = this.ourStorage.key(i);
      if (name.indexOf(Config.Storage.Key) === 0) {
        // delay because removeItem is destructive
        toClear.push(name);
      }
    }

    toClear.forEach((n) => this.ourStorage.removeItem(n));
  }
}
