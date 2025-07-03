"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setError("Failed to request tokens");
      }
      
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[#19181C]">
      <h1 className="text-[#15C0B9] text-3xl font-bold mb-6">
        Division 1 Crypto Faucet
      </h1>
      <div className="bg-[#23232a] p-8 rounded-2xl shadow-lg min-w-[320px] w-full max-w-sm">
        <label className="text-[#E6F0F0] font-medium">Solana Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your Solana address"
          className="w-full p-3 mt-3 mb-5 rounded-lg border border-[#15C0B9] text-base bg-[#E6F0F0] text-[#19181C] placeholder:text-[#15C0B9] focus:outline-none focus:ring-2 focus:ring-[#15C0B9]"
        />
        {/* Placeholder for reCAPTCHA */}
        <div className="bg-[#23232a] text-[#15C0B9] p-4 rounded-lg mb-5 text-center select-none border border-[#15C0B9]">
          [reCAPTCHA widget]
        </div>
        <button
          onClick={handleRequest}
          disabled={loading}
          className={
            `faucet-btn w-full py-3 rounded-lg font-semibold text-lg border-none transition-all duration-200 shadow-md relative overflow-hidden ` +
            (loading
              ? "bg-[#15C0B9]/60 cursor-not-allowed"
              : "bg-[#15C0B9] hover:bg-gradient-to-r hover:from-[#15C0B9] hover:to-[#E6F0F0] cursor-pointer text-[#19181C]")
          }
        >
          {loading ? "Requesting..." : "Get 100 $D1C Tokens"}
        </button>
        {success && (
          <div className="text-[#15C0B9] mt-4">
            Success! 100 $D1C tokens will be sent to your address.
          </div>
        )}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
      <style jsx>{`
        .faucet-btn {
          position: relative;
          overflow: hidden;
        }
        .faucet-btn:after {
          content: "";
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(230, 240, 240, 0.25) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-20deg);
          pointer-events: none;
        }
        .faucet-btn:hover:enabled {
          box-shadow: 0 8px 32px #15c0b988, 0 2px 8px #0003;
        }
        .faucet-btn:hover:enabled:after {
          animation: shine 0.9s forwards;
        }
        @keyframes shine {
          0% {
            left: -75%;
          }
          100% {
            left: 125%;
          }
        }
      `}</style>
    </main>
  );
}
