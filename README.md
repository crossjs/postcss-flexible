# postcss-flexible

This is a [postcss](https://www.npmjs.com/package/postcss) plugin.

## Usage

### Webpack

```
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      }
    ]
  },
  postcss: function() {
    return [require('postcss-flexible')({remUnit: 75})]
  }
}
```

### Example

before processing:

```css
.selector {
  font-size: dpr(32px);
  width: rem(75px);
  line-height: 3;
}
```

after processing:

```css
.selector {
  width: 1rem;
  line-height: 3;
}
[data-dpr="1"] .selector {
  font-size: 16px;
}
[data-dpr="2"] .selector {
  font-size: 32px;
}
[data-dpr="3"] .selector {
  font-size: 48px;
}
```

## Change Log

### 0.0.3

* add `dpr()` and `rem()`

### 0.0.0

* First release.

## License

MIT
