const speakeasy = require('speakeasy');
console.log(speakeasy.totp.verify({
  secret: 'KVKFKRCPNZQUYMLXOVYDSROQGEZCOQZX',
  encoding: 'base32',
  token: '123456'
}));
