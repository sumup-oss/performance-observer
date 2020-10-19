import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

const baseConfig = {
  input: 'dist/performance-observer.js'
};

const plugins = (opts = {}) => [
  nodeResolve(),
  babel({
    babelHelpers: 'bundled',
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['ie 11']
          }
        }
      ]
    ]
  }),
  terser({
    module: opts.terserModule,
    mangle: true,
    compress: true,
    output: {
      comments: false
    }
  })
];

const umdConfig = {
  ...baseConfig,
  output: [
    {
      file: 'dist/performance-observer.es5.umd.min.js',
      format: 'umd',
      name: 'performanceObserver'
    }
  ],
  plugins: plugins({ terserModule: false })
};

const esmConfig = {
  ...baseConfig,
  output: [
    {
      file: 'dist/performance-observer.es5.min.js',
      format: 'esm'
    }
  ],
  plugins: plugins({ terserModule: true })
};

export default [umdConfig, esmConfig];
