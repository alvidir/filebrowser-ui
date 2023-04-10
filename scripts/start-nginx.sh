#!/bin/sh

export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
export JS_TARGET=/etc/static/js/app.*.js;

cat /etc/static/index.html | envsubst $EXISTING_VARS | tee /etc/static/index.html 

for file in $JS_TARGET; do
    cat $file | envsubst $EXISTING_VARS | tee $file
done

nginx -g 'daemon off;'