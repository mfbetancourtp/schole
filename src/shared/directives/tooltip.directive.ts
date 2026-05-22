import * as bootstrap from 'bootstrap';
import i18nPlugin from '../plugins/i18n.plugin';

const t = i18nPlugin.global.t.bind(i18nPlugin);

export const TooltipDirective = {
    mounted(el: any, binding: any) {
        let place = 'bottom';

        if (binding.modifiers.right) {
            place = 'right';
        }

        if (binding.modifiers.left) {
            place = 'left';
        }

        if (binding.modifiers.top) {
            place = 'left';
        }

        if (binding.modifiers.bottom) {
            place = 'bottom';
        }
        let text: string[] = [];

        binding.value.split(' ').forEach((untranslatedText: string) => {
            text.push(t(untranslatedText));
        });

        el.setAttribute('data-bs-toggle', 'tooltip');
        el.setAttribute('data-bs-trigger', 'hover');
        el.setAttribute('title', text.join(' '));

        if (place) {
            el.setAttribute('data-bs-placement', place);
        }

        const tooltip = bootstrap.Tooltip.getOrCreateInstance(el);

        el.addEventListener('click', function () {
            tooltip.hide();
        });
    },
};
