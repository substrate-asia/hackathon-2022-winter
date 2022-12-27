// logger 提供封装好的 logrus 日志库
// 日志等级从底到高分别为：trace, debug, info, warn, error, fatal, panic
// trace 用于跟踪程序运行过程中的一些细节
// debug 用于调试程序
// info  用于重要信息
// warn  用于警告信息
// error 用于错误信息
// fatal 用于致命错误，程序将退出
// panic 用于致命错误，程序将崩溃退出，并展开堆栈调用信息
package logger

import (
	"testing"

	"github.com/sirupsen/logrus"
)

func TestLogger(t *testing.T) {
	Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	Trace("info")
	Tracef("info %s", "hello")
	Debug("info")
	Debugf("info %s", "hello")
	Info("info")
	Infof("info %s", "hello")
	Warn("info")
	Warnf("info %s", "hello")
	Error("info")
	Errorf("info %s", "hello")
}

func TestToMemory(t *testing.T) {
	Init().ToMemory().SetLevel(logrus.TraceLevel)
	Trace("hello")
	mem := Buffer()
	if mem.Len() == 0 {
		t.Fatal("error")
	}
}
