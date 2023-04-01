BINARY_NAME=filebrowser-ui
PKG_MANAGER?=dnf

all: dist

dist: protobuf
	@wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -O ./bin/jq &&	chmod +x ./bin/jq
	@./bin/jq 'to_entries | map_values({ (.key) : ("$$" + .key) }) | reduce .[] as $$item ({}; . + $$item)' ./src/config.json > ./src/config.tmp.json && mv ./src/config.tmp.json ./src/config.json
	npm i && npm run build

images:
	@podman build --no-cache --security-opt label=disable -t alvidir/$(BINARY_NAME):latest -f ./container/$(BINARY_NAME)/containerfile .

protobuf: install-deps
	@protoc  -I=. proto/*.proto \
		--js_out=import_style=commonjs,binary:./src \
		--plugin=./bin/protoc-gen-grpc-web \
		--grpc-web_out=import_style=typescript,mode=grpcwebtext:./src

	@sed -i '1s/^/\/* eslint-disable *\/\n/' ./src/proto/*

install-deps:
	-$(PKG_MANAGER) install -y protobuf-compiler
	@curl -LO https://github.com/grpc/grpc-web/releases/download/1.4.1/protoc-gen-grpc-web-1.4.1-linux-x86_64
	@mkdir -p bin && mv --force ./protoc-gen-grpc-web-1.4.1-linux-x86_64 ./bin/protoc-gen-grpc-web
	@chmod +x ./bin/protoc-gen-grpc-web

clean:
	@rm -rf bin/
	@rm -rf dist/
	@rm -rf node_modules/
	@rm -rf package-lock.json
	@rm -rf config.tmp.json
	@rm -rf src/proto

clean-images:
	@podman image rm alvidir/$(BINARY_NAME):latest

deploy:
	podman run -p 8080:80 --name $(BINARY_NAME) --env-file .env localhost/alvidir/$(BINARY_NAME):latest

undeploy:
	podman stop $(BINARY_NAME)
	podman rm -f $(BINARY_NAME)