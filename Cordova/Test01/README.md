# Setup

npm i -D

# Development



NPM link each module that you want to develop and debug locally. This overwrites the module in
node_modules with a symbol link to your local folder.

i.e.: npm link ../../../Elastos.Essentials/Plugins/Hive ../../../Elastos.Essentials/Plugins/DID/ ../../../Elastos.Connectivity.Client.Cordova.SDK/ ../../../Elastos.Essentials.Connector.Client.Cordova/

You can edit the library code directly from this test app's node_modules/ folder as this is a symlink (no copy).

Don't forget to build the library after every change, to generate JS files from TS (could be automatized).

NOTE: every time you run a command that calls "npm install" (ionic run does that sometimes) you have to call "npm link" again as previous local links are deleted by npm.

# Run

```
ionic cordova run android --livereload --external --ssl
```