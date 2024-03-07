import { useState } from "react";
import { SiweMessage } from "siwe";
import { useSignMessage } from "wagmi";
import { SignInParams } from "lib/types";

export function useSIWE(): {
  loading: boolean;
  address: `0x${string}` | null;
  signIn: (signInParams: SignInParams) => Promise<void>;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const { signMessageAsync } = useSignMessage();

  const fetchNonce = async () => {
    const nonceRes = await fetch("/api/nonce");
    const nonce = await nonceRes.text();
    return nonce;
  };

  const signIn = async ({ title, targetAddress, chainId }: SignInParams) => {
    setLoading(true);
    try {
      // Create SIWE message with pre-fetched nonce and sign with wallet
      const nonce = await fetchNonce();
      const message = new SiweMessage({
        domain: window.location.host,
        address: targetAddress,
        statement: title,
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: nonce,
        expirationTime: new Date(new Date().getTime() + 600000).toISOString(), // Requires to verify in 10 min
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // Verify signature
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
      });
      if (!verifyRes.ok) throw new Error("Error verifying message");

      setLoading(false);
      setAddress(address as `0x${string}`);
    } catch (error) {
      setLoading(false);
      setAddress(null);
      throw error;
    }
  };

  return { loading, address, signIn };
}
