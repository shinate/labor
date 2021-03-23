#!/bin/env babel-node
import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'

glob('a/*', (err, files) => {
  const links = files.map(p => {
    let fp = path.join(p, 'package.json')
    let name = path.basename(p)
    if (fs.existsSync(fp)) {
      let config = JSON.parse(fs.readFileSync(fp, 'utf-8'))
      name = config.description || config.name
    }
    return `<a href="${p}">${name}</a>`
  })
  const template = fs.readFileSync(path.join('src', 'index.html'), 'utf-8')
  const content = template.replace(/(<body>).*(<\/body>)/, `$1${links}$2`)
  fs.writeFileSync('index.html', content, 'utf-8')
})
