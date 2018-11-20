## 启动
使用`fixed mode`。  
推荐全局安装`lerna`。然后，`lerna bootstrap` 会安装各自packages下所依赖的包（不会安装peerDependecies）。

## 发布
确保仓库提交完并且干净后，`lerna pubish`选择要发布的版本号后,会自动做一下事情：  
- 找出需要更新的包,将对应包的版本号升级  
- 自动commit这次修改
- 自动打tag
- 自动push
- 自动publish对应的包  

## Todos
- Auto generate changelog in gitlab  
- Lerna publish by CI