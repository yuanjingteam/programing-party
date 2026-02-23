package main

import (
	"fmt"
	"sync"
	"time"
)

func slowTask(name string, delay time.Duration) string {
	time.Sleep(delay)
	return name + " done"
}

func main() {
	start := time.Now()

	var wg sync.WaitGroup
	wg.Add(2)

	results := make(chan string, 2)

	go func() {
		defer wg.Done()
		results <- slowTask("A", 600*time.Millisecond)
	}()

	go func() {
		defer wg.Done()
		results <- slowTask("B", 900*time.Millisecond)
	}()

	wg.Wait()
	close(results)

	for r := range results {
		fmt.Println(r)
	}

	fmt.Printf("elapsed=%dms\n", time.Since(start).Milliseconds())
}

