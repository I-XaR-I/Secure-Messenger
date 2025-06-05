import os
import mysql.connector
data = [
    0x63,
    0x7C,
    0x77,
    0x7B,
    0xF2,
    0x6B,
    0x6F,
    0xC5,
    0x30,
    0x01,
    0x67,
    0x2B,
    0xFE,
    0xD7,
    0xAB,
    0x76,
    0xCA,
    0x82,
    0xC9,
    0x7D,
    0xFA,
    0x59,
    0x47,
    0xF0,
    0xAD,
    0xD4,
    0xA2,
    0xAF,
    0x9C,
    0xA4,
    0x72,
    0xC0,
    0xB7,
    0xFD,
    0x93,
    0x26,
    0x36,
    0x3F,
    0xF7,
    0xCC,
    0x34,
    0xA5,
    0xE5,
    0xF1,
    0x71,
    0xD8,
    0x31,
    0x15,
    0x04,
    0xC7,
    0x23,
    0xC3,
    0x18,
    0x96,
    0x05,
    0x9A,
    0x07,
    0x12,
    0x80,
    0xE2,
    0xEB,
    0x27,
    0xB2,
    0x75,
    0x09,
    0x83,
    0x2C,
    0x1A,
    0x1B,
    0x6E,
    0x5A,
    0xA0,
    0x52,
    0x3B,
    0xD6,
    0xB3,
    0x29,
    0xE3,
    0x2F,
    0x84,
    0x53,
    0xD1,
    0x00,
    0xED,
    0x20,
    0xFC,
    0xB1,
    0x5B,
    0x6A,
    0xCB,
    0xBE,
    0x39,
    0x4A,
    0x4C,
    0x58,
    0xCF,
    0xD0,
    0xEF,
    0xAA,
    0xFB,
    0x43,
    0x4D,
    0x33,
    0x85,
    0x45,
    0xF9,
    0x02,
    0x7F,
    0x50,
    0x3C,
    0x9F,
    0xA8,
    0x51,
    0xA3,
    0x40,
    0x8F,
    0x92,
    0x9D,
    0x38,
    0xF5,
    0xBC,
    0xB6,
    0xDA,
    0x21,
    0x10,
    0xFF,
    0xF3,
    0xD2,
    0xCD,
    0x0C,
    0x13,
    0xEC,
    0x5F,
    0x97,
    0x44,
    0x17,
    0xC4,
    0xA7,
    0x7E,
    0x3D,
    0x64,
    0x5D,
    0x19,
    0x73,
    0x60,
    0x81,
    0x4F,
    0xDC,
    0x22,
    0x2A,
    0x90,
    0x88,
    0x46,
    0xEE,
    0xB8,
    0x14,
    0xDE,
    0x5E,
    0x0B,
    0xDB,
    0xE0,
    0x32,
    0x3A,
    0x0A,
    0x49,
    0x06,
    0x24,
    0x5C,
    0xC2,
    0xD3,
    0xAC,
    0x62,
    0x91,
    0x95,
    0xE4,
    0x79,
    0xE7,
    0xC8,
    0x37,
    0x6D,
    0x8D,
    0xD5,
    0x4E,
    0xA9,
    0x6C,
    0x56,
    0xF4,
    0xEA,
    0x65,
    0x7A,
    0xAE,
    0x08,
    0xBA,
    0x78,
    0x25,
    0x2E,
    0x1C,
    0xA6,
    0xB4,
    0xC6,
    0xE8,
    0xDD,
    0x74,
    0x1F,
    0x4B,
    0xBD,
    0x8B,
    0x8A,
    0x70,
    0x3E,
    0xB5,
    0x66,
    0x48,
    0x03,
    0xF6,
    0x0E,
    0x61,
    0x35,
    0x57,
    0xB9,
    0x86,
    0xC1,
    0x1D,
    0x9E,
    0xE1,
    0xF8,
    0x98,
    0x11,
    0x69,
    0xD9,
    0x8E,
    0x94,
    0x9B,
    0x1E,
    0x87,
    0xE9,
    0xCE,
    0x55,
    0x28,
    0xDF,
    0x8C,
    0xA1,
    0x89,
    0x0D,
    0xBF,
    0xE6,
    0x42,
    0x68,
    0x41,
    0x99,
    0x2D,
    0x0F,
    0xB0,
    0x54,
    0xBB,
    0x16,
]
round_constant = [
    [0x01, 0, 0, 0],
    [0x02, 0, 0, 0],
    [0x04, 0, 0, 0],
    [0x08, 0, 0, 0],
    [0x10, 0, 0, 0],
    [0x20, 0, 0, 0],
    [0x40, 0, 0, 0],
    [0x80, 0, 0, 0],
    [0x1B, 0, 0, 0],
    [0x36, 0, 0, 0],
]


def divide_key(input_key, n=4):
    return [input_key[i : i + n] for i in range(0, len(input_key), n)]


def string_to_hex(key_str):
    if len(key_str) % 16 != 0:
        key_str = key_str.ljust(((len(key_str) // 16) + 1) * 16)
    return [ord(c) for c in key_str]


def rotate_key(key):
    return key[3][1:] + [key[3][0]]


def substitute_key_bytes(byte_list):
    return [data[b] for b in byte_list]


def xor_with_round_constant(byte_list, round_const):
    return [byte_list[j] ^ round_const[j] for j in range(4)]


def generate_new_key(previous_key, round_const):
    temp = rotate_key(previous_key)
    temp = substitute_key_bytes(temp)
    temp = xor_with_round_constant(temp, round_const)

    new_key = [[], [], [], []]
    for j in range(4):
        new_key[0].append(temp[j] ^ previous_key[0][j])
    for j in range(1, 4):
        for k in range(4):
            new_key[j].append(new_key[j - 1][k] ^ previous_key[j][k])
    return new_key


def generate_roundkeys(initial_key, n=11):
    initial_key = string_to_hex(initial_key)
    initial_key = divide_key(initial_key)
    result = [initial_key]

    for i in range(1, n):
        previous_key = result[-1]
        new_key = generate_new_key(previous_key, round_constant[i - 1])
        result.append(new_key)

    return result

def mixcolumns(cipher):
    mul_matrix = [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]]
    for block in cipher:
        for col in range(4):
            temp_col = [block[row][col] for row in range(4)]

            for row in range(4):
                temp = 0
                for k in range(4):
                    temp = galois_add(
                        temp, galois_mult(temp_col[k], mul_matrix[row][k])
                    )
                block[row][col] = temp
    return cipher


def galois_add(a, b):
    return a ^ b


def galois_mult(a, b):
    result = 0
    irreducible_poly = 0x11B

    while b > 0:
        if b & 1:
            result ^= a

        a <<= 1

        if a & 0x100:
            a ^= irreducible_poly

        b >>= 1

    return result


def divide_list(input_list, bytes_per_word=4, words_per_group=4):
    words = [
        input_list[i : i + bytes_per_word]
        for i in range(0, len(input_list), bytes_per_word)
    ]
    groups = [
        words[i : i + words_per_group] for i in range(0, len(words), words_per_group)
    ]
    return groups

def substitute_cipher(cipher):
    return [[[data[value] for value in row] for row in block] for block in cipher]


def xor_lists(list1, list2):
    return [a ^ b for a, b in zip(list1, list2)]


def addroundkey(cipher, round_key):
    temp = cipher
    temp1 = round_key
    for i in temp:
        for j in range(4):
            i[j] = xor_lists(i[j], temp1[j])
    return temp

def shiftword(cipher):
    for block in cipher:
        block[1] = block[1][1:] + block[1][:1]
        block[2] = block[2][2:] + block[2][:2]
        block[3] = block[3][3:] + block[3][:3]
    return cipher

def encryption(message_block, round_keys, no_of_rounds=10):
    cipher = addroundkey(message_block, round_keys[0])
    for index in range(1, no_of_rounds):
        cipher = addroundkey(mixcolumns(shiftword(substitute_cipher(cipher))), round_keys[index])
    return addroundkey(substitute_cipher(shiftword(cipher)), round_keys[no_of_rounds])



def cipherTotext(cipher):
    return ''.join(chr(value) for block in cipher for row in block for value in row)

def main():
    mydb = mysql.connector.connect(host="localhost",  user="root",  password="Aakash9899" ,database="securemessenger")

    message = '';
    mycursor = mydb.cursor()
    mycursor.execute("SELECT aes_message,aes_key FROM temp")
    data=mycursor.fetchone()
    message = data[0]
    message_matrix = divide_list(string_to_hex(message))
    # print(message_matrix)
    key = data[1]
    round_keys = generate_roundkeys(key)
    # print(round_keys)
    cipher = encryption(message_matrix, round_keys)
    mycursor.execute(f'update temp set aes_encrypt="{cipher}" where aes_key="{key}"')
    mydb.commit()
    print("Encryption Done")
    return False

if __name__ == '__main__':
    main()