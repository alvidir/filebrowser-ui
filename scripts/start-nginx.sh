#!/bin/sh

export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
export JSTARGET=/etc/static/js/app.*.js;

for file in $JSTARGET; do
    cat $file | envsubst $EXISTING_VARS | tee $file
done

nginx -g 'daemon off;'