import secrets
import math
import os

def MRPT(n, k=40):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0:
        return False
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    for _ in range(k):
        a = secrets.randbelow(n - 3) + 2
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
            if x == 1:
                return False
        else:
            return False
    return True

def secrets_randprime(low, high):
    while True:
        candidate = secrets.randbelow(high - low) + low
        if candidate % 2 == 0:
            candidate += 1
        if MRPT(candidate):
            return candidate

def find_coprime(n):
    while True:
        candidate = secrets.randbelow(n-2)+2
        if math.gcd(n, candidate) == 1:
            return candidate

def generate_rsa_keys():
    # Generate prime numbers
    prime1 = secrets_randprime(10**100, 10**101)
    prime2 = secrets_randprime(10**100, 10**101)

    # Define file paths
    private_key_path = os.path.abspath("C:/Users/aakas/Desktop/DBMS sem project LOCAL/security/privatekeys.txt")
    public_key_path = os.path.abspath("C:/Users/aakas/Desktop/DBMS sem project LOCAL/security/publickeys.txt")

    # Store private keys
    with open(private_key_path, "w") as file:
        file.write(str([prime1, prime2]))

    # Generate public keys
    public_key = [prime1 * prime2, find_coprime((prime1-1)*(prime2-1))]

    # Store public keys
    with open(public_key_path, "w") as file:
        file.write(str(public_key))

if __name__ == "__main__":
    generate_rsa_keys()
    print("RSA keys generated successfully!")
