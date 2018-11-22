/**
 * Created by fed on 16/8/5.
 */


const glob = require('glob').sync;
const path = require('path');

function reducedOne(cwd) {
  return function (reduced, dir) {
    const newCwd = path.join(cwd, dir);
    if (glob('me.json', { cwd: newCwd }).length) {
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

module.exports = function (config) {
  return glob('*/', {
    cwd: config.dir,
  }).map(dir => dir.slice(0, -1)).reduce(reducedOne(config.dir), {});
};
