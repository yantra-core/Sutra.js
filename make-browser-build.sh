# Builds the browser bundle for sutra
browserify ./browser-shim.js --standalone SUTRA -o ./dist/sutra.js -t babelify

# Copy the sutra.js file to ./examples/browser
cp ./dist/sutra.js ./examples/browser/sutra.js

# Minifies the generated bundle and creates a source map
uglifyjs ./dist/sutra.js --compress --mangle --source-map "url='sutra.min.js.map',root='../',includeSources" -o ./dist/sutra.min.js
