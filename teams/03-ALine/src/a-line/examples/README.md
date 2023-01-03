## a-line-cli usage

### a-line-cli build

```shell
go build -o a-line-cli
```

### maven

pipeline file :
```yaml
version: 1.0
name: my-test2
stages:
  git-clone:
    steps:
      - name: git-clone
        uses: git-checkout
        with:
          url: https://gitee.com/mohaijiang/spring-boot-example.git
          branch: master
  code-compile:
    needs:
      - git-clone
    steps:
      - name: code-compile
        runs-on: maven:3.5-jdk-8
        run: |
          mvn clean package -Dmaven.test.skip=true

  build-image:
    needs:
      - code-compile
    steps:
      - run: |
          docker build -t mohaijiang/spring-boot-example:latest .

```

usage: 
```shell
./a-line-cli --file examples/maven.yml
```

### hardhat

pipeline file :

```yaml
version: 1.0
name: my-hardhat
stages:
  git-clone:
    steps:
      - name: git-clone
        uses: git-checkout
        with:
          url: https://github.com/mohaijiang/hardhat-example.git
          branch: main
  code-compile:
    needs:
      - git-clone
    steps:
      - name: code-compile
        runs-on: node:16
        run: |
          npm install --save-dev hardhat
          npx hardhat compile
```

usage:
```shell
./a-line-cli --file examples/hardhat.yml
```
