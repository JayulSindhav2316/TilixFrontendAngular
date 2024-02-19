import { Injectable } from '@angular/core';
import { Subject ,  Observable } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Injectable()
export class AppBreadcrumbService {

    private itemsSource = new Subject<MenuItem[]>();
    private cartSource = new Subject<string>();

    itemsHandler = this.itemsSource.asObservable();
    cartHandler = this.cartSource.asObservable();

    setItems(items: MenuItem[]) {
        this.itemsSource.next(items);
    }
    
    setCart(cart: any) {
        this.cartSource.next(cart);
    }
}
