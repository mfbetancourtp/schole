export interface ItemMenuType {
    id: string | number;
    title: string;
    icon: string;
    link?: string | null;
    externalLink?: boolean;
    children?: ItemMenuType[];
    code?: string;  
}
