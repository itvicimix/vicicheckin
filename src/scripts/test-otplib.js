const { authenticator } = require('@otplib/preset-default');
console.log(authenticator ? "exists" : "undefined");
console.log(authenticator.keyuri("a", "b", "c"));
console.log(authenticator.generate('KVKFKRCPNZQUYMLXOVYDSROQGEZCOQZX'));
