# React helper

## 开发步骤

- 创建分支  
- `npm i`  
- `npm run boostrap`  
- 进入对应的package开发，不需要再次`npm i`  
- 发起PR  

## 发布

- 在master下  
- `npm login`
- `npm i`
- `npm run boostrap`
- `npm publish`  
- 选择升级版本(Patch|Minor|Major|...)  
- 确认发布
- lerna会自动更新版本号并且提交，然后打tag，再push  

## todo

- lerna-changelog  
- CD
