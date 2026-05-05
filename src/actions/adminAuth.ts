"use server";

import * as speakeasy from "speakeasy";

export async function verifySuperAdminOtp(token: string) {
  const secret = "KVKFKRCPNZQUYMLXOVYDSROQGEZCOQZX";
  
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 1 // allow 30 seconds before and after
  });

  return verified;
}
