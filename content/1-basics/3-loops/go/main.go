package main

import "fmt"

func main() {
    // For loop
    for i := 0; i < 5; i++ {
        fmt.Println(i)
    }

    // Foreach-like
    fruits := []string{"apple", "banana", "orange"}
    for _, fruit := range fruits {
        fmt.Println(fruit)
    }

    // While-like
    j := 0
    for j < 5 {
        fmt.Println(j)
        j++
    }
}
