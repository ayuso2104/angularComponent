/*https://github.com/ricmoo/aes-js - CBC
* Metodo utilizado - Counter 
*/
(function(){
    'use strict';
	angular.module('utils', []);
	
	angular.module('utils').service('cyt', _cyt);
	
	_cyt.$inject = [];
	
	
	function _cyt(){
		return {
			_c : _cript, 
			_d : _decript
		};
		
		
		function _decript(hex){
			console.debug('[AES] informacion en hexadecimal',hex);
            var encryptedBytes = hexToBytes(hex);
			console.debug('[AES] bytes encriptados',encryptedBytes);
			var key = Base64._y.join('');
            
            key = aesjs.util.convertStringToBytes(key);
            console.debug('[AES] bytes key',key);
            var iv = aesjs.util.convertStringToBytes(Base64._x);
            console.debug('[AES] bytes iv',iv);
            var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
            var decryptedBytes = aesCbc.decrypt(encryptedBytes);
            console.debug('[AES] bytes desencriptados',decryptedBytes);
            // Convert our bytes back into text
            var decryptedText = aesjs.util.convertBytesToString(decryptedBytes);
            console.debug('[AES] resultado',decryptedBytes);
            return decryptedText;
            
		}
		
		function _cript(informacion){
			var key = Base64._y.join('');

			console.debug('[AES] informacion a encryptar',informacion);
            key = aesjs.util.convertStringToBytes(key);
            var iv = aesjs.util.convertStringToBytes(Base64._x);
            console.debug('[AES] key bytes',key);
            var textBytes = aesjs.util.convertStringToBytes(informacion);
            console.debug('[AES] iv bytes',iv);
            var aesCtr = new aesjs.ModeOfOperation.ctr(key, iv);
            var encryptedBytes = aesCtr.encrypt(textBytes);
            console.debug('[AES] bytes encriptados',encryptedBytes);
            var data = toHexString(encryptedBytes);	
            console.debug('[AES] bytes to hex',data);
            return data;
		}
		
		
	}
	
	
	
	
	
	
})();