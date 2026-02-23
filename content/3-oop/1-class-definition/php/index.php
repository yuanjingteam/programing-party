<?php
class Person {
    private $name;

    public function __construct($name) {
        $this->name = $name;
    }

    public function sayHello() {
        echo "Hello, " . $this->name;
    }
}

$p = new Person("Alice");
$p->sayHello();
?>
