public class Main {
    static class Person {
        private String name;

        public Person(String name) {
            this.name = name;
        }

        public void sayHello() {
            System.out.println("Hello, " + this.name);
        }
    }

    public static void main(String[] args) {
        Person p = new Person("Alice");
        p.sayHello();
    }
}
