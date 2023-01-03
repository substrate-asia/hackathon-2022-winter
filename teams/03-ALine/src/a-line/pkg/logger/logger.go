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
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	nested "github.com/antonfisher/nested-logrus-formatter"
	"github.com/sirupsen/logrus"
)

var l *Logger

type Logger struct {
	mu  sync.Mutex
	l   *logrus.Logger
	f   *os.File
	mem *bytes.Buffer
}

func Init() *Logger {
	l = &Logger{
		l: logrus.New(),
	}
	return l
}

func (l *Logger) SetLevel(level logrus.Level) *Logger {
	l.l.SetLevel(level)
	return l
}

func (l *Logger) ToStdout() *Logger {
	l.l.SetOutput(os.Stdout)
	l.l.SetFormatter(formatter(true))
	return l
}

func (l *Logger) ToFile() *Logger {
	l.makeLogDir()
	if l.logFile() == nil {
		return l.ToStdout()
	}
	l.l.SetOutput(l.logFile())
	l.l.SetFormatter(formatter(false))
	return l
}

func (l *Logger) ToMemory() *Logger {
	l.mem = new(bytes.Buffer)
	l.l.SetOutput(l.mem)
	l.l.SetFormatter(formatter(false))
	return l
}

func (l *Logger) ToStdoutAndFile() *Logger {
	l.makeLogDir()
	if l.logFile() == nil {
		return l.ToStdout()
	}
	multi := io.MultiWriter(os.Stdout, l.logFile())
	l.l.SetOutput(multi)
	l.l.SetFormatter(formatter(false))
	return l
}

func (l *Logger) ToStdoutAndMemory() *Logger {
	l.mem = new(bytes.Buffer)
	multi := io.MultiWriter(os.Stdout, l.mem)
	l.l.SetOutput(multi)
	l.l.SetFormatter(formatter(false))
	return l
}

func (l *Logger) ToStdoutAndFileAndMemory() *Logger {
	l.makeLogDir()
	if l.logFile() == nil {
		return l.ToStdoutAndMemory()
	}
	l.mem = new(bytes.Buffer)
	multi := io.MultiWriter(os.Stdout, l.logFile(), l.mem)
	l.l.SetOutput(multi)
	l.l.SetFormatter(formatter(false))
	return l
}

func Buffer() *bytes.Buffer {
	return l.mem
}

func ClearBuffer() {
	if l.mem == nil {
		return
	}
	l.mem.Reset()
}

func AutoClearBuffer(len int) {
	if l.mem == nil {
		return
	}
	go func(len int) {
		for {
			time.Sleep(time.Second * 1)
			if l.mem.Len() > len {
				ClearBuffer()
			}
		}
	}(len)
}

func (l *Logger) makeLogDir() {
	err := os.MkdirAll("log", os.ModePerm)
	if err != nil {
		fmt.Printf("Failed to create log dir, err: %s\n", err)
	}
}

func (l *Logger) logFile() *os.File {
	l.mu.Lock()
	if l.f != nil {
		l.mu.Unlock()
		return l.f
	}

	filename := time.Now().Local().Format("2006-01-02-15:04:05") + ".log"
	filename = filepath.Join("log", filename)
	f, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		fmt.Printf("Failed to create logfile %s, err: %s\n", filename, err)
		l.mu.Unlock()
		return nil
	}
	l.f = f
	l.mu.Unlock()
	return l.f
}

func Trace(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Trace(args...)
}

func Tracef(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Tracef(format, args...)
}

func Debug(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Debug(args...)
}

func Debugf(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Debugf(format, args...)
}

func Info(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Info(args...)
}

func Infof(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Infof(format, args...)
}

func Warn(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Warn(args...)
}

func Warnf(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Warnf(format, args...)
}

func Error(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Error(args...)
}

func Errorf(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Errorf(format, args...)
}

func Fatal(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Fatal(args...)
}

func Fatalf(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Fatalf(format, args...)
}

func Panic(args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Panic(args...)
}

func Panicf(format string, args ...interface{}) {
	entry := l.l.WithFields(logrus.Fields{})
	entry.Data["file"] = fileInfo(2)
	entry.Panicf(format, args...)
}

func formatter(isConsole bool) *nested.Formatter {
	fmtter := &nested.Formatter{
		HideKeys:        true,
		TimestampFormat: "2006-01-02 15:04:05",
	}
	if isConsole {
		fmtter.NoColors = false
	} else {
		fmtter.NoColors = true
	}
	return fmtter
}

func fileInfo(skip int) string {
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		file = "<???>"
		line = 1
	} else {
		slash := strings.LastIndex(file, "/")
		if slash >= 0 {
			file = file[slash+1:]
		}
	}
	return fmt.Sprintf("%s:%d", file, line)
}
