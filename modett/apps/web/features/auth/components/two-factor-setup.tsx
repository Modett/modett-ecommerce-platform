"use client";

import { useState } from "react";
import { generate2FA, enable2FA } from "../api";
import { Loader2, Copy, Check, ShieldCheck, ShieldAlert } from "lucide-react";

export function TwoFactorSetup() {
  const [step, setStep] = useState<"initial" | "scan" | "verify" | "success">(
    "initial"
  );
  const [secret, setSecret] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCode: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generate2FA();
      setSecret(data);
      setStep("scan");
    } catch (err: any) {
      setError(err.message || "Failed to generate 2FA secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || !secret) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await enable2FA(verificationCode, secret.secret);
      setBackupCodes(data.backupCodes);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "initial") {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-500">
              Secure your account with 2FA.
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Add an extra layer of security to your account. You will need an
          authenticator app like Google Authenticator or Authy to scan a QR
          code.
        </p>
        <button
          onClick={handleStartSetup}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Enable 2FA
        </button>
        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  if (step === "scan") {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Open your authenticator app and scan the QR code below.
        </p>

        <div className="flex justify-center mb-6">
          {secret?.qrCode && (
            <img
              src={secret.qrCode}
              alt="2FA QR Code"
              className="border p-2 rounded"
            />
          )}
        </div>

        <div className="mb-6">
          <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">
            Secret Key
          </label>
          <div className="flex gap-2">
            <code className="p-2 bg-gray-100 rounded text-sm flex-1 font-mono">
              {secret?.secret}
            </code>
            <button
              onClick={() => copyToClipboard(secret?.secret || "")}
              className="p-2 hover:bg-gray-100 rounded"
              title="Copy secret"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Enter Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full p-2 border rounded text-center text-xl tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify & Enable"
            )}
          </button>
          <button
            onClick={() => setStep("initial")}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-green-50 rounded-full mb-3">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            2FA Enabled Successfully!
          </h3>
          <p className="text-gray-500 mt-2">
            Your account is now more secure. Save your backup codes in a safe
            place.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 text-sm">
                Backup Codes
              </h4>
              <p className="text-yellow-700 text-xs mt-1">
                If you lose access to your authenticator app, you can use these
                codes to log in. Each code can only be used once.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-sm">
            {backupCodes.map((code, i) => (
              <div
                key={i}
                className="bg-white p-2 rounded border border-yellow-200 text-center"
              >
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const text = backupCodes.join("\n");
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }}
            className="mt-4 w-full py-2 text-sm text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
          >
            Copy All Codes
          </button>
        </div>

        <button
          onClick={() => setStep("initial")} // Or refresh/reload to update user state
          className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          Done
        </button>
      </div>
    );
  }

  return null;
}
