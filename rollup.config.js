import buble from '@rollup/plugin-buble'

const entry = 'src/Thenable.js'

const builds = [
  // ES module file
  {
    input: entry,
    output: {
      format: 'esm',
      file: `dist/Thenable.esm.js`
    },
    plugins: [
      buble()
    ]
  },
  // UMD file
  {
    input: entry,
    output: {
      format: 'umd',
      file: `dist/Thenable.umd.js`,
      name: 'Thenable',
    },
    plugins: [
      buble()
    ]
  },
]

export default builds
