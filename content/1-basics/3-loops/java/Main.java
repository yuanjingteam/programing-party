public class Main {
    public static void main(String[] args) {
        // For loop
        for (int i = 0; i < 5; i++) {
            System.out.println(i);
        }

        // Foreach
        String[] fruits = {"apple", "banana", "orange"};
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // While
        int j = 0;
        while (j < 5) {
            System.out.println(j++);
        }
    }
}
