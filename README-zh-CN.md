# postcss-flexible 0.5.x使用及配置方法
------

postcss-flexible 0.5.x此次主要更新目的是为了满足用户根据不同的fontGear获得不同的css数据结构的需求。本次更新主要增加以下自定义配置项：

> * `fontGear`: array, default `[-1, 0, 1, 2, 3, 4]`， 需要使用的字体档位
> * `enableFontSetting`: boolean, default `false`， 是否开启字体档位功能
> * `addFontSizeToSelector`: function， 用户自定义如何针对不同档位输出计算后的值
> * `outputCSSFile`: function， 用户自定义输出css


------

## 主要函数介绍

    addFontSizeToSelector(originFontSize, gear, baseDpr) -> {Number}
在原始css中定义的值（originFontSize），根据字体档位（gear）和基础dpr(baseDpr)，通过插件计算，返回生成新的值。插件默认为每一个档位之间的差值为1px。
### 函数定义
```javascript
var addFontSizeToSelector = function (originFontSize, gear, baseDpr) {
  if (!gear) {
    gear = 0
  }
  if (!enableFontSetting) {
    return originFontSize
  }
  if (options.addFontSizeToSelector) {
    return options.addFontSizeToSelector(originFontSize, gear, baseDpr)
  }
  return +originFontSize + gear*baseDpr
```
### 函数参数
| 参数名 | 类型   |  描述  |
| :- |
| `originFontSize`|  string \| Number |  原始css中定义的值 |
| `gear`         |   Number   |   字体档位   |
| `baseDpr`         |    Number    |  基础dpr  |
### 返回值
返回一个数字类型的值（Number）

    outputCSSFile(gear, clonedRoot) -> {undefined}
在用户开启字体档位功能后，用户可重写outputCSSFile方法，插件在每次遍历fontGear生成修改后的clonedRoot后，会调用此函数，并将clonedRoot作为参数传递，用户可以自定义以何种方式处理该css（可输出文件，也可在控制台中打印）
### 函数定义
```javascript
var outputCSSFile = options.outputCSSFile || function (gear, clonedRoot) {}
```
### 函数参数
| 参数名 | 类型   |  描述  |
| :- |
| `gear`|  string \| Number |  字体档位 |
| `clonedRoot`         |   postcss结构   |   修改后的postcss结构   |
### 返回值
无返回值


----------


## 如何使用
### webpack配置
若用户开启输出字体档位功能，需要在webpack.config.js中对postcss-flexible插件添加对应属性，以下为将不同字体档位的css文件输出到static目录（生产环境在根目录）下的配置文件片段：

```javascript
// 因为要输出文件的关系，这里需要引入fs
import fs from 'fs'


function deleteFolderRecursive (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
if (__PROD__) {
// 生产环境下将fontGear文件输出到dist目录，需要在每次compile的时候判断是否存在dist目录，若不存在    则生成，并且在dist目录下生成fontGear目录；若存在fontGear目录则需删除其中的文件
  if (!fs.existsSync(paths.dist())) {
    fs.mkdirSync(paths.dist())
    fs.mkdirSync(paths.dist('fontGear'))
  } else {
    deleteFolderRecursive(paths.dist('fontGear'))
    if (!fs.existsSync(paths.dist('fontGear'))) {
      fs.mkdirSync(paths.dist('fontGear'))
    }
  }
} else {
// 非生产环境下需要在每次compile时删除static下的fontGear目录及文件
  if (fs.existsSync(paths.src('static/fontGear'))) {
    deleteFolderRecursive(paths.src('static/fontGear'))
  }
}

// ------------------------------------
// Plugins
// ------------------------------------
// 用于保存每次调用生成的postcss数据结构，以避免生成重复的样式声明
const cachedRoot = {}

const vueLoaderOptions = {
  postcss: pack => {
    return [
      require('postcss-import')({
        path: paths.src(`themes/${config.theme}`)
      }),
      require('postcss-url')({
        basePath: paths.src('static')
      }),
      require('postcss-cssnext')({
        // see: https://github.com/ai/browserslist#queries
        browsers: 'Android >= 4, iOS >= 7',
        features: {
          customProperties: {
            variables: require(paths.src(`themes/${config.theme}/variables`))
          }
        }
      }),
      require('postcss-browser-reporter')(),
      require('postcss-reporter')(),
      // 由于开启postcss-flexible的字体档位功能直接输出文件的关系，这里将插件放在postcss插件的最后一         个，以保证其他插件的功能均已转换完成
      require('postcss-flexible')({
        remUnit: 75,
        enableFontSetting: true, // 开启字体档位功能
        fontGear: [-1, 0, 1, 2, 3, 4], // 自定义字体档位
        // 自定义输出函数
        outputCSSFile: (gear, clonedRoot) => {
          const content = clonedRoot.toString()
          if (!(gear in cachedRoot)) {
            cachedRoot[gear] = []
          }
          // 只将没有输出过的postcss结构写入到对应的文件中
          if (cachedRoot[gear].indexOf(content) === -1) {
            if (__PROD__) {
              fs.writeFileSync(paths.dist(`fontGear/fontGear_${gear}.css`), clonedRoot, {
                encoding: 'utf8',
                flag: 'a'
              })
            } else {
              if (!fs.existsSync(paths.src('static/fontGear'))) {
                fs.mkdirSync(paths.src('static/fontGear'))
              }
              fs.writeFileSync(paths.src(`static/fontGear/fontGear_${gear}.css`), content, {
                encoding: 'utf8',
                flag: 'a'
              })
            }
            cachedRoot[gear].push(content)
          }
        }
      })
    ]
  },
  autoprefixer: false
}

```
### 项目中引入
在入口文件中获取字体档位，并向根元素添加data-fontgear属性，根据字体档位加载对应的css文件：
```javascript
if (window.Bridge) {
  const appFontSet = window.Bridge.require('im.app.setting.font.size')
  const appFontNum = appFontSet.getCurrentGearValue() || 0
  const root = document.documentElement
  root.setAttribute('data-fontgear', appFontNum)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = `./fontGear/fontGear_${appFontNum}.css`
  document.head.appendChild(link)
}
```