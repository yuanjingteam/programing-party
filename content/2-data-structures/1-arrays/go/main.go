package main

import "fmt"

func main() {
    fruits := []string{"Apple", "Banana"}
    
    // Append
    fruits = append(fruits, "Orange")
    
    fmt.Println(fruits[0])
    fmt.Println(len(fruits))
}
