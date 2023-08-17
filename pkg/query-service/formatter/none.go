package formatter

import "fmt"

type noneFormatter struct{}

func NewNoneFormatter() Formatter {
	return &noneFormatter{}
}

func (f *noneFormatter) Format(value float64, _ string) string {
	return fmt.Sprintf("%v", value)
}
