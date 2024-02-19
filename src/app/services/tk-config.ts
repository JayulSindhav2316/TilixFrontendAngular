import { InjectionToken } from '@angular/core';
import { Config } from '../models/auth-net/config';

export const TK_CONFIG = new InjectionToken<Config>('Config');