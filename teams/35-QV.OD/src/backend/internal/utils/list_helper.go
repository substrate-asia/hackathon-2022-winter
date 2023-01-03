package utils

func FindElementInList[T comparable](elem T, elemList []T) int {
	for idx, e := range elemList {
		if e == elem {
			return idx
		}
	}

	return -1
}
