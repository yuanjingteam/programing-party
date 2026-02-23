package main

import (
	"context"
	"fmt"
	"time"
)

func slowTask(ctx context.Context) (string, error) {
	select {
	case <-time.After(3 * time.Second):
		return "finished", nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	result, err := slowTask(ctx)
	if err != nil {
		fmt.Println("timeout:", err)
		return
	}
	fmt.Println(result)
}

