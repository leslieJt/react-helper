// @TODO inface this way is unsafe
class DefineHelper {
  constructor() {
    this.identifiers = [];
    this.count = 0;
  }

  addFunc(name, args, body) {
    const normalId = this.uniqueIdentifier(name);
    this.identifiers.push(`function ${normalId}(${args.join(',')}) {
        ${body}
    }`);
  }

  addConst(name, define) {
    const normalId = this.uniqueIdentifier(name);
    this.identifiers.push(`const ${normalId} = ${define};`);
  }

  uniqueIdentifier(name) {
    this.count += 1;
    return `${name}${this.count}`;
  }

  toDefineList() {
    return this.identifiers.join('\n');
  }
}

module.exports = DefineHelper;
