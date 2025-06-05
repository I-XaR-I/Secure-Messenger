import sympy

# Read private keys from file
with open("privatekeys.txt", "r") as file:
    prvt_keys = eval(file.read())

# Read public keys from file
with open("publickeys.txt", "r") as file:
    public_key = eval(file.read())

# Read encrypted message from file
with open("rsa_encrypted.txt", "r") as file:
    encrypted_messg = int(file.read())

''' Decryption '''
d = sympy.mod_inverse(public_key[1], (prvt_keys[0]-1)*(prvt_keys[1]-1))
decrypted_messg_int = pow(encrypted_messg, d, public_key[0])
decrypted_messg = decrypted_messg_int.to_bytes((decrypted_messg_int.bit_length() + 7) // 8, byteorder='big').decode('utf-8')

# Store decrypted message in a file
with open("rsa_decrypted.txt", "w") as file:
    file.write(decrypted_messg)

print("Decrypted message stored in rsa_decrypted.txt")