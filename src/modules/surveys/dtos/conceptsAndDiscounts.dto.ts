import { ConceptDto } from "./concept.dto";
import { DiscountDto } from "./discount.dto";

export interface ConceptsAndDiscountsDto {
    products: ConceptDto[];
    discounts: DiscountDto[];
}