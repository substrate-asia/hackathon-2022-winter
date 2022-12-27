package utils

import (
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// app logger
var appLogger *zap.SugaredLogger

func init() {
	//writerSyncer := getLogWriter()
	//encoder := getEncoder()
	//core := zapcore.NewCore(encoder, writerSyncer, zapcore.DebugLevel)
	//logger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
	logger, _ := zap.NewDevelopment()
	appLogger = logger.Sugar()
	defer appLogger.Sync()
}

func getEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	return zapcore.NewConsoleEncoder(encoderConfig)
}

func getLogWriter() zapcore.WriteSyncer {
	lumberJackLogger := &lumberjack.Logger{
		Filename:   "./storage/logs/app.log",
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	return zapcore.AddSync(lumberJackLogger)
}

func Debug(args ...interface{}) {
	appLogger.Debug(args...)
}

func Debugf(template string, args ...interface{}) {
	appLogger.Debugf(template, args...)
}

func Info(args ...interface{}) {
	appLogger.Info(args...)
}

func Infof(template string, args ...interface{}) {
	appLogger.Infof(template, args...)
}

func Warn(args ...interface{}) {
	appLogger.Warn(args...)
}

func Warnf(template string, args ...interface{}) {
	appLogger.Warnf(template, args...)
}

func Error(args ...interface{}) {
	appLogger.Error(args...)
}

func Errorf(template string, args ...interface{}) {
	appLogger.Errorf(template, args...)
}

func DPanic(args ...interface{}) {
	appLogger.DPanic(args...)
}

func DPanicf(template string, args ...interface{}) {
	appLogger.DPanicf(template, args...)
}

func Panic(args ...interface{}) {
	appLogger.Panic(args...)
}

func Panicf(template string, args ...interface{}) {
	appLogger.Panicf(template, args...)
}

func Fatal(args ...interface{}) {
	appLogger.Fatal(args...)
}

func Fatalf(template string, args ...interface{}) {
	appLogger.Fatalf(template, args...)
}
