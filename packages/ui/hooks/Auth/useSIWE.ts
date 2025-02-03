import { useState } from "react";
import { SiweMessage } from "siwe";
import { useSignMessage } from "wagmi";
import { SignInParams } from "lib/types";

export function useSIWE(): {
  loading: boolean;
  address: `0x${string}` | null;
  signIn: (signInParams: SignInParams) => Promise<void>;
  safeAddress?: `0x${string}`;
  error?: Error;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const { signMessageAsync } = useSignMessage();

  const fetchNonce = async () => {
    const nonceRes = await fetch("/api/nonce");
    const nonce = await nonceRes.text();
    return nonce;
  };

  const signIn = async ({ title, targetAddress, chainId, safeAddress }: SignInParams) => {
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
        expirationTime: new Date(new Date().getTime() + 60000 * 60).toISOString(), // Requires to verify in 60 min
      });

      if (safeAddress) {
        message.resources = [safeAddress];
      }

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // Verify signature
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature, chainId }),
      });

      const res = await verifyRes.json();
      if (!verifyRes.ok) setError(new Error(res.error ? res.error : "Error verifying message"));

      setLoading(false);
      setAddress(address as `0x${string}`);
    } catch (error: unknown) {
      setLoading(false);
      setAddress(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return { loading, address, signIn, error };
}
