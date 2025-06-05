//Node server which will handle our socket.io connections
const cors = require('cors');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded({ extended: true });
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Add this line to import the crypto module
const { exec } = require('child_process');
const fs = require('fs').promises;

const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    credentials: true
};
app.use(cors(corsOptions));

const server = app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
const socketIo = require('socket.io')(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aakash9899',
    database: 'securemessenger'
});
db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the database');
    }
});
app.use(express.json()); // Add this line to parse JSON requests

app.post('/sign-up', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).send('Username or Email already taken');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let aesKey;
        let isUnique = false;

        while (!isUnique) {
            aesKey = crypto.randomBytes(8).toString('hex'); // Generate a random 16-letter AES key
            const [existingKey] = await db.promise().query('SELECT * FROM users WHERE aes_key = ?', [aesKey]);
            if (existingKey.length === 0) {
                isUnique = true;
            }
        }

        await db.promise().query('INSERT INTO users (username, email, password_hash, aes_key) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, aesKey]);
        const [user] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);
        await db.promise().query('INSERT INTO authentication (user_id, password_hash) VALUES (?, ?)', [user[0].user_id, hashedPassword]);

        // Execute the generate_rsa_keys.py script
        exec('python "C:\\Users\\aakas\\Desktop\\DBMS sem project LOCAL\\security\\generate_rsa_keys.py"', async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send('Error occurred during key generation');
            }

            try {
                // Read the generated keys
                const publicKeys = JSON.parse(await fs.readFile('C:\\Users\\aakas\\Desktop\\DBMS sem project LOCAL\\security\\publickeys.txt', 'utf8'));
                const privateKeys = JSON.parse(await fs.readFile('C:\\Users\\aakas\\Desktop\\DBMS sem project LOCAL\\security\\privatekeys.txt', 'utf8'));

                // Insert keys into User_Keys table
                await db.promise().query('INSERT INTO User_Keys (user_id, rsa_public_key, rsa_private_key, aes_key) VALUES (?, ?, ?, ?)', 
                    [user[0].user_id, JSON.stringify(publicKeys), JSON.stringify(privateKeys), aesKey]);

                res.status(200).send('Registration successful');
            } catch (readError) {
                console.error('Error reading key files:', readError);
                res.status(500).send('Error occurred during key file reading');
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error occurred during registration');
    }
});

app.post('/sign-in', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.log('Invalid username');
            return res.status(400).send('Invalid username or password');
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            await db.promise().query('UPDATE authentication SET login_attempts = login_attempts + 1 WHERE user_id = ?', [user.user_id]);
            console.log('Invalid password');
            return res.status(400).send('Invalid username or password');
        }
        await db.promise().query('UPDATE authentication SET last_login = CURRENT_TIMESTAMP, login_attempts = 0 WHERE user_id = ?', [user.user_id]);

        console.log('Login successful');
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).send('Error occurred during sign-in');
    }
});

app.get('/search-friends', async (req, res) => {
    const query = req.query.query;
    try {
        const [friends] = await db.promise().query(
            'SELECT username FROM users WHERE username LIKE ? LIMIT 10',
            [`%${query}%`]
        );
        res.json(friends);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while searching for friends');
    }
});

app.post('/add-friend', async (req, res) => {
    const { friendUsername, username } = req.body;

    try {
        const [friend] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [friendUsername]);

        if (friend.length === 0) {
            return res.status(400).send('User not found');
        }

        const [user] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);

        await db.promise().query('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [user[0].user_id, friend[0].user_id]);
        await db.promise().query('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [friend[0].user_id, user[0].user_id]); // Ensure mutual friendship
        res.status(200).send('Friend added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while adding friend');
    }
});

app.get('/get-friends', async (req, res) => {
    const username = req.query.username;

    try {
        const [user] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(400).send('User not found');
        }

        const [friends] = await db.promise().query(
            'SELECT u.username FROM friends f JOIN users u ON f.friend_id = u.user_id WHERE f.user_id = ?',
            [user[0].user_id]
        );
        res.json(friends);
    } catch (error) {
        console.error('Error occurred while fetching friends:', error);
        res.status(500).send('Error occurred while fetching friends');
    }
});

const users = {};

socketIo.on('connection', socket => {
    socket.on('new-user-joined', name => {
        console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', async data => {
        console.log("Message received on server:", data); // Debugging statement
        const { message, username: senderName } = data;
        const [sender] = await db.promise().query('SELECT aes_key FROM users WHERE username = ?', [senderName]);
        const aesKey = sender[0].aes_key;

        // Write message and AES key to files
        await db.promise().query('INSERT INTO temp (username,aes_message, aes_key) VALUES (? , ? , ?)', [senderName,message, aesKey]);
        // Execute encryption script
        exec('python "C:\\Users\\aakas\\Desktop\\DBMS sem project LOCAL\\security\\aes_encrypt_optim.py"', async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            // Read encrypted message
            const [encrypteddata] = await db.promise().query('SELECT aes_encrypt FROM temp WHERE username = ?', [senderName]);
            console.log("Encrypted data:",encrypteddata); // Debugging statement
            const encryptedMessage = encrypteddata[0].aes_encrypt;
            console.log("Encrypted message:",encryptedMessage ); // Debugging statement

            // Insert message into database
            const [senderRow] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [senderName]);
            const senderId = senderRow[0].user_id;

            for (const socketId in users) {
                if (users[socketId] !== senderName) {
                    const [recipient] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [users[socketId]]);
                    await db.promise().query('INSERT INTO messages (sender_id, recipient_id, encrypted_message) VALUES (?, ?, ?)', [senderId, recipient[0].user_id, encryptedMessage]);
                    const[messgid]= await db.promise().query('SELECT MAX(message_id) as message_id from messages');
                    await db.promise().query('insert into message_status(message_id, status) values( ?, ?)', [messgid[0].message_id, 'sent']);
                    await db.promise().query('truncate table temp');
                }
            }
            
            // Broadcast encrypted message to users currently in the chat
            socket.broadcast.emit('receive', { message: encryptedMessage, name: senderName });
        });
    });
    socket.on('decrypt', async data => {
        console.log("Message received for decryption:", data); // Debugging statement
        const { encryptedMessage: encryptedMessage, senderName: senderName } = data;
        console.log(senderName); // Debugging statement
        const [sender] = await db.promise().query('SELECT aes_key FROM users WHERE username = ?', [senderName]);
        console.log("Sender:", sender); // Debugging statement
        const aesKey = sender[0].aes_key;
        console.log("AES key:", aesKey); // Debugging statement
        
        // Write encrypted message and AES key to files
        await db.promise().query('replace INTO temp (username,aes_encrypt, aes_key) VALUES (? , ? , ?)', [senderName,encryptedMessage, aesKey]);
        
        console.log("AES key:", aesKey); // Debugging statement
        
        // Execute decryption script
        exec('python "C:\\Users\\aakas\\Desktop\\DBMS sem project LOCAL\\security\\aes_decrypt.py"', async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            
            // Read decrypted messaged
            const [decrypteddata] = await db.promise().query('SELECT aes_decrypt FROM temp WHERE username = ?', [senderName]);
            const[messgid]= await db.promise().query('SELECT MAX(message_id) as message_id from messages');
            console.log("nhdwbdwjhbd    ",messgid); // Debugging statement
            await db.promise().query('update message_status set status= ? where message_id= ? ', [ 'delivered',messgid[0].message_id]);
            await db.promise().query('delete from temp');
            const decryptedMessage = decrypteddata[0].aes_decrypt;
            console.log("Decrypted message:", decryptedMessage); // Debugging statement
            
            // Display decrypted message
            socket.emit('display', { message: decryptedMessage, name: senderName });
        });
    });
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});