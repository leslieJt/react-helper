const path = require('path');

class ImportHelper {
  constructor(start = 0) {
    this.dependencies = {};
    this.count = start;
  }

  addDependencies(dependency, name) {
    if (Object.prototype.hasOwnProperty.call(this.dependencies, dependency)) {
      if (name) {
        this.dependencies[dependency].push(name);
        return name;
      }
      return this.dependencies[dependency][0];
    }
    let id = name;
    if (!id) {
      id = this.uniqueIdentifier(dependency);
    }
    this.dependencies[dependency] = [id];
    return id;
  }

  uniqueIdentifier(name) {
    this.count += 1;
    const normalName = name.slice(0, name.length - path.extname(name).length)
      .replace(/[-/.]/g, '_')
      .replace(/^_*/, '')
      .replace(/_([a-z])/g, (_, target) => target.toUpperCase());
    return `${normalName}_${this.count}`;
  }

  toImportList() {
    let result = '';
    Object.keys(this.dependencies).forEach((dep) => {
      const ids = this.dependencies[dep];
      ids.forEach((id) => {
        result += `import ${id} from '${dep}';\n`;
      });
    });
    return result;
  }
}

module.exports = ImportHelper;
