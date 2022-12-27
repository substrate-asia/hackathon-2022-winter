package platform

import (
	"fmt"
	"github.com/hamster-shared/a-line/pkg/logger"
	"os"
	"os/exec"
	"syscall"
	"time"
)

// GetFileCreateTime get file create time
func GetFileCreateTime(path string) *time.Time {
	var createTime time.Time
	osType := runtime.GOOS
	fileInfo, _ := os.Stat(path)
	wFileSys := fileInfo.Sys().(*syscall.Win32FileAttributeData)
	tNanSeconds := wFileSys.CreationTime.Nanoseconds()
	tSec := tNanSeconds / 1e9
	createTime = time.Unix(tSec, 0)
	fmt.Println("windows create time: ", createTime)
	return &createTime
}

// OpenDir Open folder
func OpenDir(path string) error {
	cmd := exec.Command("explorer", path)
	err := cmd.Run()
	if err != nil {
		logger.Errorf("windows open dir failed with %s\n", err.Error())
		return err
	}
	return nil
}
