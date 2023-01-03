web:
	rm -rf pkg/controller/dist
	cd frontend && yarn && yarn build

macos:
	go mod tidy
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64  go build -o aline

linux:
	go mod tidy
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64  go build -o aline

windows:
	go mod tidy
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64  go build -o aline.exe
