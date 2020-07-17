import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.ts',
    external: ['react', '@codeciting/open-form'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx']
      }), // so Rollup can find `ms`
      babel({
        babelHelpers: 'bundled',
        exclude: ['node_modules/**'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs']
      })
    ]
  }
]
