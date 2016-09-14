# postcss-dpr

This is a [postcss](https://www.npmjs.com/package/postcss) plugin.

## Usage

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
    return [require('postcss-dpr')({remUnit: 75})]
  }
}
```

## Change Log

### 0.0.0

* First release.

## License

MIT
