JSB_FLAGS="-r -s 2 -n -p -m 2 -B -k -C"

js-beautify -f src/node_find.es6 %JSB_FLAGS%
js-beautify -f src/test_async.es6 %JSB_FLAGS%
