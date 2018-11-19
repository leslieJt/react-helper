/**
 * Created by fed on 16/8/5.
 */


const glob = require('glob').sync;
const path = require('path');

function reducedOne(cwd) {
  return function (reduced, dir) {
    const newCwd = path.join(cwd, dir);
    if (glob('view.jsx', { cwd: newCwd }).length) {
      // 目录下存在view.jsx
      reduced[dir] = true;
      return reduced;
    }
    const matched = glob('*/', {
      cwd: newCwd,
    });
    if (matched.length) {
      reduced[dir] = matched.map(dir => dir.slice(0, -1)).reduce(reducedOne(newCwd), {});
    } else {
      reduced[dir] = true;
    }
    return reduced;
  };
}
// 把含有view.jsx的目录构建成一个目录树
module.exports = function (config) {
  // 列出目录，去掉'/'，
  return glob('*/', {
    cwd: config.dir,
  }).map(dir => dir.slice(0, -1)).reduce(reducedOne(config.dir), {});
};
