export interface RecentActivityDto {
    id: number;
    courseId: number;
    name: string;
    dateUntil: string;
    rowOrder?: any;
    pendingDeliveries: number;
}
