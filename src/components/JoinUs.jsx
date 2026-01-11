import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";

const JoinUs = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && address) {
      navigate("/app");
    }
  }, [isConnected, address, navigate]);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-[#f0fdf9] via-white to-[#e0f7ef]">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Ready to Start Investing?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Join thousands of investors who are building their real estate
          portfolios on Mantle Network with Graso.
        </p>
        <div className="custom-connect-button">
          <ConnectButton label="Connect Wallet" />
        </div>
      </div>
    </section>
  );
};

export default JoinUs;
