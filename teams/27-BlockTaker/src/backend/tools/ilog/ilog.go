package ilog

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
)

var (
	Logger *zap.SugaredLogger
)

// Init 初始化zap
// @param jsonFormat 是否使用json格式化输出
// @param logFile 日志输出到文本路径，为空则输出到终端
func Init(jsonFormat bool, logFile string) {
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "name",
		CallerKey:      "line",
		MessageKey:     "msg",
		FunctionKey:    "func",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.TimeEncoderOfLayout("2006-01-02 15:04:05.000"),
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.FullCallerEncoder,
		EncodeName:     zapcore.FullNameEncoder,
	}

	var encoder zapcore.Encoder
	var writer zapcore.WriteSyncer

	if jsonFormat {
		encoder = zapcore.NewJSONEncoder(encoderConfig) //json输出
	} else {
		encoder = zapcore.NewConsoleEncoder(encoderConfig) //标准日志输出
	}

	if logFile != "" {
		writer, _ = os.Create(logFile) //日志写入文件
	} else {
		writer = zapcore.AddSync(os.Stdout) //文件输出终端
	}

	zapCore := zapcore.NewCore(
		encoder,
		writer,
		zapcore.DebugLevel,
	)
	logger := zap.New(zapCore, zap.AddCaller())
	Logger = logger.Sugar()
	defer logger.Sync()
}
