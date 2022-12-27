package external_apis

import "fmt"

type ApiConnectionError struct {
	Endpoint string
}

func (e *ApiConnectionError) Error() string {
	return fmt.Sprintf("connection to endpoint %s failed", e.Endpoint)
}
