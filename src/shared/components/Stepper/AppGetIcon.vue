<template>
  <div :class="`container-icon ${classIcon}`" v-html="getIcon()"></div>
</template>

<script lang="ts">
import { ICONS } from '../../../assets/images/BankIconsData';
/**
 * Componente para mostrar iconos SVG.
 *
 * @component
 * @example
 * <AppGetIcon name="mi-icono"  fillColor="#FF0000" strokeColor="#000000" />
 */
export default {
  /**
   * Props del componente.
   *
   * @prop {string} name - Nombre del icono.
   * @prop {string} [width=1em] - Ancho del icono.
   * @prop {string} [height=1em] - Altura del icono.
   * @prop {string} [fillColor=none] - Color de relleno del icono.
   * @prop {string} [strokeColor=none] - Color de los trazos del icono.
   */
  props: {
    name: {
      type: String,
      required: true,
      /**
       * Nombre del icono. Este prop es obligatorio.
       *
       * @type {string}
       */
    },
    classIcon: {
      type: String,
      default: '',
      /**
       * clase dinamica del icono. Valor por defecto: "".
       *
       * @type {string}
       */
    },
    width: {
      type: String,
      default: '100%',
      /**
       * Ancho del icono. Valor por defecto: "100%".
       *
       * @type {string}
       */
    },
    height: {
      type: String,
      default: '100%',
      /**
       * Altura del icono. Valor por defecto: "100%".
       *
       * @type {string}
       */
    },
    fillColor: {
      type: String,
      default: 'none',
      /**
       * Color de relleno del icono. Valor por defecto: "none".
       *
       * @type {string}
       */
    },
    strokeColor: {
      type: String,
      default: 'none',
    },
    /**
     * Color de los trazos del icono. Valor por defecto: "none".
     *
     * @type {string}
     */
  },
  methods: {
    /**
     * Retorna el código HTML del icono con las propiedades especificadas.
     *
     * @returns {string} Código HTML del icono.
     */
    getIcon() {
      const icon = ICONS[this.name];
      if (!icon) {
        console.error(`Icon "${this.name}" not found in ICONS object.`);
        return '';
      }
      // Replace fill, stroke, width, and height values in SVG string with props.
      let svgString = icon
        .replace(/width="\d+"/, `width="${this.width}"`)
        .replace(/height="\d+"/, `height="${this.height}"`);

      if (this.fillColor !== 'none') {
        svgString = svgString.replace(
          /fill="[^"]+"/g,
          `fill="${this.fillColor}"`
        );
      }

      if (this.strokeColor !== 'none') {
        svgString = svgString.replace(
          /stroke="[^"]+"/g,
          `stroke="${this.strokeColor}"`
        );
      }

      return svgString;
    },
  },
};
</script>
<style scoped>
.container-icon {
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}
</style>
