package main

import (
	"errors"
	"fmt"
	"time"
)

var attempts = 0

func unstableOperation() (string, error) {
	attempts++
	if attempts < 3 {
		return "", errors.New("temporary failure")
	}
	return "ok", nil
}

func main() {
	maxAttempts := 5
	backoff := 200 * time.Millisecond

	for i := 1; i <= maxAttempts; i++ {
		result, err := unstableOperation()
		if err == nil {
			fmt.Println("success:", result)
			return
		}

		fmt.Printf("attempt %d failed: %v\n", i, err)
		if i == maxAttempts {
			fmt.Println("giving up")
			return
		}

		time.Sleep(backoff)
		backoff *= 2
	}
}

