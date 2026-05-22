import { createI18nMessage, helpers } from '@vuelidate/validators';
import * as validators from '@vuelidate/validators';
import i18n from './i18n.plugin';

const defaultPathValidations = 'core.validationRules';

// @ts-ignore
const messagePath = (props) => {
  // Este log sirve para verificar los parametros de una regla de validacion, se puede usar todos, los importantes son los de params
  // console.log(props);
  // return `${defaultPathValidations}.${props.$validator}`;
  return `${defaultPathValidations}.${props.$validator ?? props.$params.type}`;
};

const withI18nMessage = createI18nMessage({
  t: i18n.global.t.bind(i18n),
  messagePath,
});

export const url = withI18nMessage(validators.url);
export const required = withI18nMessage(validators.required);
export const maxLength = withI18nMessage(validators.maxLength, {
  withArguments: true,
});
export const minLength = withI18nMessage(validators.minLength, {
  withArguments: true,
});
export const minValue = withI18nMessage(validators.minValue, {
  withArguments: true,
});
export const maxValue = withI18nMessage(validators.maxValue, {
  withArguments: true,
});
export const numeric = withI18nMessage(validators.numeric);
export const requiredIf = withI18nMessage(validators.requiredIf, {
  withArguments: true,
});
export const sameAs = withI18nMessage(validators.sameAs, {
  withArguments: true,
});

/*Files*/
const defaultMaxSize = 5; //MB

const validateMaxSize = (file: File, maxSize: number) => {
  const fileSize = file.size;

  return fileSize < maxSize * 1000 * 1000;
};

const validateExtensions = (file: File, extensions: string[]) => {
  const fileName = file.name;
  let validExtension = false;
  const fileExtension = fileName.split('.').pop();

  extensions.forEach((ext) => {
    if (fileExtension == ext) {
      validExtension = true;
    }
  });

  return validExtension;
};

export const maxSize = (maxSize?: number | null) =>
  helpers.withMessage(
    `Este campo debe tener un peso máximo de ${maxSize ?? defaultMaxSize}MB`,
    (value: File) => {
      if (!maxSize) {
        maxSize = defaultMaxSize;
      }

      if (!value) return true;

      return validateMaxSize(value, maxSize);
    }
  );

export const extensions = (extensions: string[]) =>
  helpers.withMessage(
    `Este campo debe ser de tipo: ${extensions.join(', ')}`,
    (value: File) => {
      if (!value) return true;

      return validateExtensions(value, extensions);
    }
  );

// Validador de imagenes

const validateImage = (file: File) => {
  const extensions = [
    'tiff',
    'pip',
    'jfif',
    'bmp',
    'gif',
    'svg',
    'png',
    'xbm',
    'dib',
    'jx',
    'jpeg',
    'svgz',
    'jpg',
    'webp',
    'ico',
    'tif',
    'pjpeg',
    'avif',
  ];

  const validExtension = validateExtensions(file, extensions);
  const validSize = validateMaxSize(file, defaultMaxSize);

  return validExtension && validSize;
};

export const defaultImage = helpers.withMessage(
  `Este campo debe ser una imagen, con un peso máximo de ${defaultMaxSize}MB`,
  (value: any) => {
    if (!value) return true;

    if (value instanceof File) {
      return validateImage(value);
    }

    return false;
  }
);

/*Files*/
