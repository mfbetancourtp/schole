import reportsStore from '../stores/reports.store';
import {ItemMenuReportType} from '../types/itemMenuReport.type';

export class ReportsService {
    set(items: ItemMenuReportType[]) {
        console.log("items",items);
        reportsStore.methods.set(items);
    }
    
    get() {
        return reportsStore.methods.get();
    }
}