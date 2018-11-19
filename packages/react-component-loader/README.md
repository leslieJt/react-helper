# React Component Loader

## 安装
- `npm i -D react-redux-component-loader`

## 特性
- 将目录映射为路由
- 支持页面组件、model的懒加载（默认）
- 针对React Router v4
- 对webpack热打包的完全支持
- 可以自动给types加上namespace
- 简单的"数据绑定"

## 约定

#### 基本约定
- 每个有view.jsx的文件夹都对应一个页面
- 每个页面都需有`view.jsx`,`reducer.js`, `saga.js` 这三个文件，分别对应于视图入口、model、异步操作
- 除了loader配置中`externals`选项中出现的页面，所有页面均需要`me.json`文件
- 如果最后一级的文件夹名为`/list`, 那么将拥有两个路由，为`${prefix}`以及`${prefix}/list[${args}]`, 如果list页面需要参数必须使用完整链接
- 如果一个文件夹不存在`view.jsx`，则该文件夹会被当作公共组件文件夹，其中的所有`*.jsx`都将被包含入`app.bundle.js`中

#### `me.json`配置
````js
{
  "description": "",
  "crumb": [],
  "route": "/:id?", // 页面的路由参数，具体规则见React-Router的文档
  "sync": true,  // 默认为false，如果设置为true，该页面将不会懒加载
  "retain": true // 默认为false，若设为true，则页面对应的state会retain
}
````

#### 自动给type加上namespace
- 需要有单独的一个文件导出types
- 需配置loader以及babel-plugin，方法详见[示例](example/webpack.config.js)中的 `types.js`部分
- 如果不需要加名空间，type的值需是`:global:`开头
- 可以只声明不定义(必须使用`let`或不推荐的`var`)，如此将会把标识符的名称作为字符串的值
- 所加的namespace前缀可读性你会满意的

#### 版本约束
- React Router: 4
- React Router Redux(如果需要): 5
- React: >=15
- Node: >= 4

## 示例
具体见[example](example)

#### 主要的配置及文件

- [webpack.conf](example/webpack.config.js): 如果需要提高性能，可以用externals大法，可以启用`babel-loader`的`cacheDirectory`功能，也可以使用happyPack
- [babel配置](example/.babelrc)
- [入口文件](example/src/entry.jsx)
- [路由文件](example/src/components/root.jsx)
- [model及异步整合](example/src/components/index.js)

#### 简单的数据绑定
- 在JSX的情况下，如果设定`data-bind`属性为x，那么将会把值x与model同名属性x绑定


####  简单运行这个项目
-  git clone该项目
-  `npm i && cd example && npm i && npm run build`
-  打开`example/index.html`即可
