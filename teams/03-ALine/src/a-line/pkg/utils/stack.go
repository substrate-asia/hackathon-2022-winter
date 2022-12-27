package utils

import (
	"errors"
)

// Stack 堆栈
type Stack[T interface{}] struct {
	elements []T
}

// Push 入栈
func (s *Stack[T]) Push(value T) {
	s.elements = append(s.elements, value)
}

// Pop 出栈
func (s *Stack[T]) Pop() (T, error) {
	if len(s.elements) == 0 {
		return *new(T), errors.New("empty stack")
	}
	a := s.elements
	defer func() {
		s.elements = a[:len(a)-1]
	}()
	return a[len(a)-1], nil
}

// IsEmpty 判断堆栈是否为空
func (s *Stack[T]) IsEmpty() bool {
	return len(s.elements) == 0
}
