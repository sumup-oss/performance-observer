import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  input: 'lib/performance-observer.js',
  output: [
    {
      file: 'dist/performance-observer.min.js',
      format: 'umd',
      name: 'performanceObserver'
    }
  ],
  plugins: [
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
      module: false,
      mangle: true,
      compress: true,
      output: {
        comments: false
      }
    })
  ]
};
