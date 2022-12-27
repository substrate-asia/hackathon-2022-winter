package utils

import "testing"

func TestRandString(t *testing.T) {
	tests := []int{5, 10, 15, 20, 25, 30}
	for _, tt := range tests {
		got := RandString(tt)
		if len(got) != tt {
			t.Errorf("Error. want len: %d, got len: %d", tt, len(got))
		}
	}
}
