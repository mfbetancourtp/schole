import { PropType } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { VariantsConstant } from '../../constant/variants.constant';
import { SizesConstant } from '../../constant/sizes.constant';

type nativeTypes = 'button' | 'submit' | 'reset';

export const PropsButton = {
  label: {
    type: String,
    default: null,
  },
  to: {
    type: Object as PropType<RouteLocationRaw>,
    default: null,
  },
  variant: {
    type: String as PropType<VariantsConstant>,
    default: 'primary',
  },
  size: {
    type: String as PropType<SizesConstant>,
    default: 'md',
  },
  loadingGeneral: {
    type: Boolean,
    default: true,
  },
  nativeType: {
    type: String as PropType<nativeTypes>,
    validator: (value: string) => {
      return ['button', 'submit', 'reset'].indexOf(value) >= 0;
    },
  },
  href: String,
  target: String,
  icon: String,
  iconLeft: String,
  iconRight: String,
  outlined: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
  expanded: Boolean,
  link: {
    type: Boolean,
    default: false,
  },
};
