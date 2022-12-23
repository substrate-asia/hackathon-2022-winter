package icmd

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

// 执行常规命令
func Exec(args string) (string, error) {
	cmd := exec.Command("/bin/bash", "-c", args)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout // 标准输出
	cmd.Stderr = &stderr // 标准错误
	if err := cmd.Run(); err != nil {
		return "", errors.New(stderr.String())
	}
	return strings.Trim(stdout.String(), "\n"), nil
}

// 管道响应
func PipeExec(args string, ch *chan []byte) error {
	cmd := exec.Command("/bin/bash", "-c", args)
	//StdoutPipe方法返回一个在命令Start后与命令标准输出关联的管道。Wait方法获知命令结束后会关闭这个管道，一般不需要显式的关闭该管道。
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	if err = cmd.Start(); err != nil {
		return err
	}
	//创建一个流来读取管道内内容，这里逻辑是通过一行一行的读取的
	reader := bufio.NewReader(stdout)
	//实时循环读取输出流中的一行内容
	for {
		line, err2 := reader.ReadBytes('\n')
		if err2 != nil || io.EOF == err2 {
			break
		}
		if ch != nil {
			*ch <- line
		} else {
			fmt.Println(string(line))
		}
	}
	//阻塞直到该命令执行完成，该命令必须是被Start方法开始执行的
	if err = cmd.Wait(); err != nil {
		return err
	}
	return nil
}
