// Node.js built in crypto library
var crypto = require('crypto');

// bcrypt library
var bcrypt = require('bcrypt-nodejs');

var password = 'my_password';

// Set master key
var masterKey = 'codemotion_key';

// A generic hash function to use the
// crypto library with different hashes
function hash(alg, password) {
    // Start timer
    console.time(alg);

    // Create hex result of hash
    var hash = crypto.createHash(alg);
    hash.update(password);
    var result = hash.digest('hex');

    // Log result and time taken
    console.log(alg + ': ' + result);
    console.timeEnd(alg);
}

var hashPassword = function(password,callback){

	// Start timer
    console.time('bcrypt');
	bcrypt.genSalt(10,function(err,salt){
		if(err){
			console.log('error'+err);
			callback(err);
		}
		bcrypt.hash(password,salt,null,function(err,hash){
			if(err){
				console.log('error'+err);
				callback(err);
			}
			callback(null,hash);
		});
	});	
};

// A function to perform encryption
function encrypt(data) {
    // Create cipher and encrypt value
    var enc = crypto.createCipher('aes192', masterKey);
    enc.end(data);
    var encrypted = enc.read(); // Read the buffer

    // We will store the data in base64 format,
    // because utf8 will cause problems -
    // the various characters in utf8 can break
    // or be lost in the storage/retrieval process
    return encrypted.toString('base64');
}

// A function to perform decryption
function decrypt(data) {
    // Create decipher
    var dec = crypto.createDecipher('aes192', masterKey);

    // Create buffer from encrypted value and decrypt
    var encrypted = new Buffer(data, 'base64');
    dec.end(encrypted);

    // Read data and convert back to utf8
    return dec.read().toString('utf8');
}

// Calculate
hash('md5', password);
hash('sha1', password);
hash('sha256', password);
hash('sha512', password);
hashPassword(password,function(error,result){
	// Log result and time taken
    console.log('bcrypt: ' + result);
    console.timeEnd('bcrypt');
});

console.log('encrypt(password): ' + encrypt(password));
console.log('decrypt(password): ' + decrypt(encrypt(password)));
