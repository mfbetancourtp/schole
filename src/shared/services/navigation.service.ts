import navigationStore from '../stores/navigation.store';
import {ItemMenuType} from '../types/itemMenu.type';

export class NavigationService {
    set(items: ItemMenuType[]) {
        navigationStore.methods.set(items);
    }

    get() {
        return navigationStore.methods.get();
    }
}