# Setup

npm i -D

# Development

NPM link each module that you want to develop and debug locally. This overwrites the module in
node_modules with a symbol link to your local folder.

i.e.: npm link path/to/local/elastos-connectivity-sdk path/to/local/essentials-connector-sdk path/to/local/elastos-cordova-plugin-did

You can edit the library code directly from this test app's node_modules/ folder as this is a symblink (no copy).

Don't forget to build the library after every change, to generate JS files from TS (could be automatized).

# Run

ionic cordova run android --livereload --external --ssl