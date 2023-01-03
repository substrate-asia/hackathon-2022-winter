package app_storage

import (
	"fmt"

	"github.com/pkg/errors"
)

var (
	KvStore map[string]any
)

func Init() {
	KvStore = make(map[string]any)
}

func Set[T any](key string, val T) {
	KvStore[key] = val
}

func Get[T any](key string) (T, error) {
	value, existing := KvStore[key]
	if existing {
		return value.(T), nil
	} else {
		var null T
		return null, errors.New(fmt.Sprintf("key %s not found", key))
	}
}
