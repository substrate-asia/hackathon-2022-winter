package utils

import (
	"fmt"
	"strings"
	"testing"
)

func Test_GetRedundantPath(t *testing.T) {
	shortPath := "/a/b/"
	longPath := "/a/b/c/d.txt"
	index := strings.Index(longPath, shortPath)
	fmt.Println(index)
	if index == 0 {
		relativePath := longPath[len(shortPath):]
		if relativePath[0] == '/' {
			fmt.Println(relativePath[1:])
		} else {
			fmt.Println(relativePath)
		}
	}
}
