package utils

import "testing"

func TestFindElementInList(t *testing.T) {
	tests := []struct {
		list []int
		elem int
		want int
	}{
		{
			list: []int{1, 3, 5},
			elem: 3,
			want: 1,
		},
		{
			list: []int{1, 3, 5, 11, 22, 33, 89, 90},
			elem: 90,
			want: 7,
		},
		{
			list: []int{},
			elem: 1,
			want: -1,
		},
	}

	for _, tt := range tests {
		got := FindElementInList(tt.elem, tt.list)
		if got != tt.want {
			t.Errorf("Error. want: %d, got: %d", tt.want, got)
		}
	}
}
