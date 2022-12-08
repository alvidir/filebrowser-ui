install: install-grpc-web install-protoc

install-grpc-web:
	curl -LO https://github.com/grpc/grpc-web/releases/download/1.4.1/protoc-gen-grpc-web-1.4.1-linux-x86_64
	mkdir --parents bin
	mv --force ./protoc-gen-grpc-web-1.4.1-linux-x86_64 ./bin/protoc-gen-grpc-web
	chmod +x ./bin/protoc-gen-grpc-web

install-protoc:
	curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v3.20.3/protoc-3.20.3-linux-x86_64.zip
	mkdir --parents bin
	unzip -o protoc-3.20.3-linux-x86_64.zip -d ./bin/protoc
	chmod +x ./bin/protoc && rm protoc-3.20.3-linux-x86_64.zip

proto: install
	./bin/protoc/bin/protoc -I=. proto/*.proto \
		--js_out=import_style=commonjs,binary:./src \
		--plugin=./bin/protoc-gen-grpc-web \
		--grpc-web_out=import_style=typescript,mode=grpcwebtext:./src

	sed -i '1s/^/\/* eslint-disable *\/\n/' ./src/proto/*.ts

build:
	podman build --no-cache --security-opt label=disable -t alvidir/filebrowser-ui:latest -f ./container/filebrowser-ui/containerfile .


deploy:
	podman run -p 8080:80 --name filebrowser-ui --env-file .env alvidir/filebrowser-ui:latest

undeploy:
	podman stop filebrowser-ui
	podman rm -f filebrowser-ui

clean:
	rm -rf bin

all: proto clean