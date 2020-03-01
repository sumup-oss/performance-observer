import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/performance-observer.ts',
  output: [
    {
      file: 'dist/performance-observer.min.js',
      format: 'umd',
      name: 'createPerformanceObserver'
    }
  ],
  plugins: [
    typescript(),
    terser({
      output: {
        comments: false
      }
    })
  ]
};
