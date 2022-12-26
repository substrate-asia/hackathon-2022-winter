package utils

import "github.com/shopspring/decimal"

func Add(a, b string) string {
	num1, _ := decimal.NewFromString(a)
	num2, _ := decimal.NewFromString(b)
	d := num1.Add(num2)
	return d.Truncate(8).String()
}
