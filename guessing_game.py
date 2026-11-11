print("Welcome to my number guessing game!\nGuess a number between 1 and 100")
import random

secret_number = random.randint(1, 100)
guess = 0


attempts = 0
while guess != secret_number:
    try:
        guess = input("Enter your guess: ")
        guess = int(guess)
        if guess < 1 or guess >100:
            print("Please enter a number between 1 and 100.")
            continue
        attempts = attempts + 1
    except ValueError:
        print("Please enter a whole number.")
        continue

    if guess == secret_number:
        print("You guessed correctly")
    elif guess < secret_number:
        print("Too low!")
    else:
        print("Too high!")

if attempts <= 7:
    print("Excellent guessing!")
else:
    print('Keep practicing! You can do better next time.')
print("Total attempts:", attempts)