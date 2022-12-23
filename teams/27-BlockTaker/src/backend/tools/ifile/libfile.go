package ifile

import (
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"syscall"
	"time"
	"tools/icmd"
)

// 调用os.MkdirAll递归创建文件夹
func MakeDir(filePath string, perm ...os.FileMode) error {
	var p os.FileMode
	if len(perm) == 0 {
		p = os.ModePerm
	} else {
		p = perm[0]
	}
	if !IsExist(filePath) {
		err := os.MkdirAll(filePath, p)
		return err
	}
	return nil
}

// 延迟建立文件件，防止建立过快监听未跟上
func MkDirSleep(dirPath string, sleep time.Duration) {
	paths := ""
	arr := strings.Split(dirPath, "/")
	for _, v := range arr {
		if v != "" {
			paths += "/" + v
			if !IsExist(paths) {
				_ = os.Mkdir(paths, os.ModePerm)
				time.Sleep(sleep)
			}
		}
	}
}

// 判断所给路径文件/文件夹是否存在(返回true是存在)
func IsExist(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		if os.IsExist(err) {
			return true
		}
		return false
	}
	return true
}

// 返回文件最后修改时间
func UpdTime(path string) int64 {
	f, err := os.Open(path)
	if err != nil {
		return 0
	}
	defer func() {
		_ = f.Close()
	}()
	var fi os.FileInfo
	if fi, err = f.Stat(); err != nil {
		return 0
	}
	return fi.ModTime().Unix()
}

// FileStat 读取文件信息
func FileStat(path string) os.FileInfo {
	f, err := os.Stat(path)
	if err == nil {
		return f
	} else if os.IsExist(err) {
		return f
	} else {
		return nil
	}
}

// GetOnlyName 获取唯一名字
func GetOnlyName(fsPath string) string {
	var n int
	paths, name := path.Split(fsPath)
	ext := path.Ext(name)
	pre := strings.TrimSuffix(name, ext)
BACK:
	if !IsExist(paths + name) {
		return paths + name
	}
	n++
	name = fmt.Sprintf("%s-%d%s", pre, n, ext)
	goto BACK
}

// 文件信息
type Fi struct {
	Ino   int64
	Name  string
	Size  int64
	IsDir bool
}

// GetInode 读取文件信息
func GetInode(paths string) (*Fi, error) {
	fi, err := os.Stat(paths)
	if err != nil {
		return nil, err
	}
	item := &Fi{
		Ino:   int64(fi.Sys().(*syscall.Stat_t).Ino),
		Name:  fi.Name(),
		Size:  fi.Size(),
		IsDir: fi.IsDir(),
	}
	return item, nil
}

// DirSubTotal 读取文件夹子项数量
func DirSubTotal(paths string) (int, error) {
	sub, err := icmd.Exec(fmt.Sprintf("ls '%s' | wc -l", paths))
	if err != nil {
		return 0, err
	}
	total, _ := strconv.Atoi(strings.Trim(strings.TrimSpace(sub), "\n"))
	return total, nil
}
