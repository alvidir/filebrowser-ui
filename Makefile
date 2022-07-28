install: install-grpc-web install-protoc

install-grpc-web:
	curl -LO https://github.com/grpc/grpc-web/releases/download/1.3.0/protoc-gen-grpc-web-1.3.0-linux-x86_64
	mv ./protoc-gen-grpc-web-1.3.0-linux-x86_64 /usr/local/bin/protoc-gen-grpc-web
	chmod +x /usr/local/bin/protoc-gen-grpc-web

install-protoc:
	curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v3.19.3/protoc-3.19.3-linux-x86_64.zip
	unzip protoc-3.19.3-linux-x86_64.zip -d /usr/local/protoc
	chmod +x /usr/local/protoc && rm protoc-3.19.3-linux-x86_64.zip

proto:
	protoc -I=. proto/*.proto \
		--js_out=import_style=commonjs,binary:./src \
		--grpc-web_out=import_style=typescript,mode=grpcwebtext:./src

	sed -i '1s/^/\/* eslint-disable *\/\n/' ./src/proto/*.ts

build:
	podman build --no-cache --security-opt label=disable -t alvidir/filebrowser-ui:latest -f ./container/filebrowser-ui/containerfile .