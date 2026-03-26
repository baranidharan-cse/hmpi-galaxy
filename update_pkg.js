const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('hmpi-web-app/package.json', 'utf8'));
pkg.homepage = "https://baranidharan-cse.github.io/hmpi-galaxy";
pkg.scripts = pkg.scripts || {};
pkg.scripts.deploy = "gh-pages -d dist";
fs.writeFileSync('hmpi-web-app/package.json', JSON.stringify(pkg, null, 2));
