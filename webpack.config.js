import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function webpack_config(env, argv) {
  return {
    entry: './src/component-app.js',
    mode: (env.production ? 'production' : 'development'),
    output: {
      clean: true,
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: [/\bmessages_en\.yaml$/],
          type: 'javascript/auto',
          loader: '@messageformat/loader',
          options: { locale: ['en'] }
        }
      ]
    },
    devServer: {
      static: './dist'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Agricola',
        scriptLoading: 'module'
      }),
      new webpack.DefinePlugin({
        // see deploy.yml
        VERSION: (env.version ?? JSON.stringify('dev'))
      }),
    ]
  };
}

