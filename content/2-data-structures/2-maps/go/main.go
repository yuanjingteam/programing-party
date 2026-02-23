package main

import "fmt"

func main() {
    scores := map[string]int{
        "Alice": 95,
        "Bob":   88,
    }
    
    fmt.Println(scores["Alice"])
}
