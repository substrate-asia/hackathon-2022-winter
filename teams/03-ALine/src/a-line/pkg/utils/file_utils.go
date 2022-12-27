package utils

import (
	"errors"
	"os"
	path2 "path"
	"path/filepath"
	"strings"
)

// GetFiles 获取文件路径集合
// workdir 基础路径
// fuzzyPath 要赛选的路径
// pathList 查找到的路径对象
func GetFiles(workdir string, fuzzyPath []string, pathList []string) []string {
	files, _ := os.ReadDir(workdir)
	flag := false
	for _, file := range files {
		currentPath := workdir + "/" + file.Name()
		for _, path := range fuzzyPath {
			matched, err := filepath.Match(path, currentPath)
			flag = matched
			if matched && err == nil {
				pathList = append(pathList, currentPath)
			}
		}
		if file.IsDir() && !flag {
			pathList = GetFiles(currentPath, fuzzyPath, pathList)
		}
	}
	return pathList
}

// GetSuffixFiles 获取路径下的所有相同后缀文件
// workdir 基础路径
// suffixName 要赛选的路径
// pathList 查找到的路径对象
func GetSuffixFiles(workdir string, suffixName string, pathList []string) []string {
	files, _ := os.ReadDir(workdir)
	for _, file := range files {
		currentPath := workdir + "/" + file.Name()
		if file.IsDir() {
			pathList = GetSuffixFiles(currentPath, suffixName, pathList)
		} else {
			if filepath.Ext(currentPath) == suffixName {
				pathList = append(pathList, currentPath)
			}
		}
	}
	return pathList
}

// GetFilenameWithSuffixAndFilenameOnly 获取带后置的文件名和不带后缀的文件名
func GetFilenameWithSuffixAndFilenameOnly(path string) (fileName string, fileNameWithSuffix string) {
	_, file := path2.Split(path)
	var filenameWithSuffix string
	filenameWithSuffix = path2.Base(file)
	var fileSuffix string
	fileSuffix = path2.Ext(filenameWithSuffix)
	var filenameOnly string
	filenameOnly = strings.TrimSuffix(filenameWithSuffix, fileSuffix)
	return filenameWithSuffix, filenameOnly
}

// GetRedundantPath 获取多余的路径 longPath相对于shortPath的 /a/b/  /a/b/c/d.txt
// return c/d.txt
func GetRedundantPath(shortPath string, longPath string) (err error, path string) {
	index := strings.Index(longPath, shortPath)
	if index == 0 {
		relativePath := longPath[len(shortPath):]
		if relativePath[0] == '/' {
			return nil, relativePath[1:]
		} else {
			return nil, relativePath
		}
	}
	return errors.New("path does not contain"), ""
}
