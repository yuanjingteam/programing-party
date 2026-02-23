package main

import (
	"fmt"
	"os"
)

func main() {
	_, err := os.ReadFile("missing.txt")
	if err != nil {
		fmt.Println("read failed:", err)
		return
	}

	fmt.Println("ok")
}

