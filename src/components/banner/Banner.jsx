import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function Banner() {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    if (isConnected && address && !isNavigating) {
      setIsNavigating(true);
      navigate("/app");
    }
  }, [isConnected, address, navigate, isNavigating]);

  return (
    <section
      className="landing-banner pt-40 pb-[10rem] px-4 max-w-screen overflow-hidden bg-gradient-to-b from-white via-[#e6f9f5] to-[#f9f9f9]"
      data-aos="fade-up"
    >
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          data-aos="fade-up"
        >
          Invest in Real Estate with{" "}
          <span className="text-[#24C2A5]">Blockchain</span>
        </h1>
        <p
          className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Graso makes real estate investment accessible to everyone. Buy
          fractional ownership in premium properties using cryptocurrency on
          Mantle Network.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="custom-connect-button">
            <ConnectButton label="Start Investing" />
          </div>
          <a
            href="https://graso.gitbook.io/graso"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-transparent text-[#24C2A5] border-2 border-[#24C2A5] rounded-full font-semibold hover:bg-[#24C2A5] hover:text-white transition-all duration-300"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

export default Banner;
