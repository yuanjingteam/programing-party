package main

import "fmt"

type Person struct {
    Name string
}

func (p *Person) SayHello() {
    fmt.Println("Hello,", p.Name)
}

func main() {
    p := Person{Name: "Alice"}
    p.SayHello()
}
