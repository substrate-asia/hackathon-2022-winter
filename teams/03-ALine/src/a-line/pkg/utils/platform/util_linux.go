package platform

import (
	"github.com/hamster-shared/a-line/pkg/logger"
	"os"
	"os/exec"
	"syscall"
	"time"
)

// GetFileCreateTime get file create time
func GetFileCreateTime(path string) *time.Time {
	var createTime time.Time
	fileInfo, _ := os.Stat(path)
	stat_t := fileInfo.Sys().(*syscall.Stat_t)
	createTime = time.Unix(stat_t.Ctim.Sec, 0)
	return &createTime
}

// OpenDir Open folder
func OpenDir(path string) error {
	cmd := exec.Command("nautilus", path)
	err := cmd.Run()
	if err != nil {
		logger.Errorf("linux open dir failed with %s\n", err.Error())
		return err
	}
	return nil
}
