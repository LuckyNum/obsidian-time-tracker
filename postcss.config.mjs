import discard from 'postcss-discard';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import prefixer from 'postcss-prefix-selector';

const mediaToContainer = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-media-to-container',
    AtRule: {
      media: (atRule) => {
        const params = atRule.params.toLowerCase();
        let containerQuery = '';

        if (params.includes('min-width')) {
          const width = params.match(/min-width:\s*(\d+)(px|em|rem)?/);
          if (width) {
            containerQuery = `(min-width: ${width[1]}${width[2] || 'px'})`;
          }
        } else if (params.includes('max-width')) {
          const width = params.match(/max-width:\s*(\d+)(px|em|rem)?/);
          if (width) {
            containerQuery = `(max-width: ${width[1]}${width[2] || 'px'})`;
          }
        }

        if (containerQuery) {
          const containerRule = atRule.clone({
            name: 'container',
            params: containerQuery,
          });

          atRule.replaceWith(containerRule);
        }
      },
    },
  };
};

mediaToContainer.postcss = true;

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    prefixer({
      prefix: '.custom-next',
      exclude: ['.custom-next', '.custom-dialog', '.custom-select'],

      // Optional transform callback for case-by-case overrides
      transform: function (prefix, selector, prefixedSelector, filePath, rule) {
        if (selector === '.theme-dark' || selector === '.theme-light') {
          return selector + ' ' + `:is(.custom-dialog,.custom-select, .custom-next)`;
        } else {
          return (
            prefixedSelector +
            ' ' +
            `,.custom-dialog ${selector}, .custom-select ${selector}, ${selector}:where(.custom-dialog,.custom-select)`
          );
        }
      },
    }),
    discard({
      rule: ['html', 'body'],
    }),
    mediaToContainer(),
  ],
};
