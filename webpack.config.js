import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: './src/components/app.js',
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    static: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Agricola',
      scriptLoading: 'module'
    })
  ]
};

