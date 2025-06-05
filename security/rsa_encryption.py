# Read private keys from file
with open("privatekeys.txt", "r") as file:
    prvt_keys = eval(file.read())

# Read public keys from file
with open("publickeys.txt", "r") as file:
    public_key = eval(file.read())

messg = input("Enter the message: ")

''' Encryption '''
int_ascii_messg = int.from_bytes(messg.encode('utf-8'), byteorder='big')
encrypted_messg = pow(int_ascii_messg, public_key[1], public_key[0])

# Store encrypted message in a file
with open("rsa_encrypted.txt", "w") as file:
    file.write(str(encrypted_messg))

print("Encrypted message stored in rsa_encrypted.txt")