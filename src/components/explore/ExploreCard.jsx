import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../Timer";
import mnt from "../../assets/mnt.png";
import { Link, useLocation } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { contributeToCampaign, getProjectInfo } from "../../utils";
import { getImageUrl } from "../../utils/api/files/route";

export default function ExploreCard({ data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isShowingFullDescription, setIsShowingFullDescription] = useState(false);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const [txHash, setTxHash] = useState("");


  useEffect(() => {
    setIsHome(location.pathname === "/");
  }, [location.pathname]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleMapModal = () => {
    setIsMapModalOpen(!isMapModalOpen);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
      setIsMapModalOpen(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    
    console.log("🔵 Invest button clicked");
    console.log("   Contribution amount:", contributionAmount);
    console.log("   Is connected:", isConnected);
    console.log("   Property ID:", data.id);
    
    if (!contributionAmount) {
      alert("Please enter an amount to invest");
      return;
    }
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsContributing(true);

    try {
      const amountInMNT = Number(contributionAmount);
      console.log("   Amount in MNT:", amountInMNT);
      
      const hash = await contributeToCampaign(data.id, amountInMNT);
      console.log("✅ Investment successful! TX:", hash);
      
      setTxHash(hash);
      setContributionAmount("");
      alert("Investment successful!");
      navigate("/app/investor");
    } catch (error) {
      console.error("❌ Error contributing:", error);
      alert(`Investment failed: ${error.message || error}`);
    } finally {
      setIsContributing(false);
    }
  };

  useEffect(() => {
    if (isModalOpen || isMapModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.pointerEvents = "none";
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, isMapModalOpen]);

  const truncateDescription = (text) => {
    if (!text) return '';
    if (text.length <= 100) return text;
    return text.slice(0, 100) + '...';
  };

  return (
    <div className="flex flex-col justify-between rounded-t-[2.1rem] rounded-b-3xl bg-[#24C2A5] w-[20rem] h2rem] space-y-1 min-w-[250px]">
      <div className="bg-white rounded-b-3xl rounded-t-[2rem] flex-grow overflow-hidden">
        <div className="p-4 w-full h-full flex flex-col justify-between">
          <img
            src={getImageUrl(data.image) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2324C2A5' width='400' height='200'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16'%3EProperty Image%3C/text%3E%3C/svg%3E"}
            className="w-full h-40 object-cover rounded-lg"
            alt={data.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2324C2A5' width='400' height='200'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16'%3EProperty Image%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="flex-grow">
            <h1 className="font-bold pt-4 text-2xl">{data.title}</h1>
            <h2 className="text-gray-400">{`Longitude: ${data.longitude}`}</h2>
            <h2 className="text-gray-400">{`Latitude: ${data.latitude}`}</h2>

            <div className="relative">
              <div className={`relative ${isShowingFullDescription ? '' : 'h-[90px]'} overflow-hidden`}>
                <small className="font-sans leading-1 text-xs font-small">
                  {truncateDescription(data.description)}
                </small>
                {data.description.length > 100 && (
                  <button
                    onClick={() => setIsShowingFullDescription(!isShowingFullDescription)}
                    className="text-[#24c2a5] text-xs hover:underline ml-1"
                  >
                    See More
                  </button>
                )}
              </div>

              {isShowingFullDescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
                    <small className="font-sans leading-1 text-sm">
                      {data.description}
                    </small>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setIsShowingFullDescription(false)}
                        className="text-[#24c2a5] hover:underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center">
              <small>Targeted Raise</small>
              <div className="flex mb-2 items-center gap-x-2">
                {/* <img src={mnt} alt="MNT" className="w-[1rem] h-[1rem]" /> */}
                MNT
                <h2>{Number(data.price).toLocaleString()}</h2>
              </div>
            </div>
            <progress max="15" value={(Number(data.currentAmount) / Number(data.price)).toFixed(1)} />
          </div>

          <button
            className="mt-4 hidden md:block bg-[#24c2a5] w-full px-4 py-2 rounded-full text-white hover:border-solid hover:bg-white hover:text-[#24C2A5] transition-all duration-300"
            onClick={toggleMapModal}
          >
            View on Map
          </button>
          <Link
            to={`/map/${data.id}`}
            className="mt-4 md:hidden block"
            state={{ mapData: data }}
          >
            <button className="w-full bg-[#24c2a5] px-4 py-2 rounded-full text-white hover:border-solid hover:bg-white hover:text-[#24C2A5] transition-all duration-300">
              View on Map
            </button>
          </Link>

          <div className="flex justify-between items-center gap-4 pt-4">
            <div>
              <small className="font-semibold">Min.Entry</small>
              <h1 className="text-teal-500 font-semibold">2.95 MNT</h1>
            </div>
            <button
              className="hidden md:block bg-[#24c2a5] w-auto px-4 py-2 rounded-full text-white hover:border-solid hover:bg-white hover:text-[#24C2A5] transition-all duration-300"
              onClick={toggleModal}
            >
              INVEST
            </button>
            <Link to="/demo" className="md:hidden block">
              <button className="bg-[#24c2a5] w-auto px-4 py-2 rounded-full text-white hover:border-solid hover:bg-white hover:text-[#24C2A5] transition-all duration-300">
                INVEST
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Timer dateTimestamp={Number(data.deadline)} />

      {/* Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md h-[90%] overflow-y-auto relative"
            style={{ pointerEvents: "auto" }}
          >
            <h2 className="text-xl font-bold mb-4">{data.name} - Investment</h2>
            <img
              src={getImageUrl(data.image) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2324C2A5' width='400' height='200'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16'%3EProperty Image%3C/text%3E%3C/svg%3E"}
              alt="Property"
              className="w-full h-40 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2324C2A5' width='400' height='200'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16'%3EProperty Image%3C/text%3E%3C/svg%3E";
              }}
            />

            {/* Property Details */}
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Location:</strong> {data.location}
              </p>
              <p className="text-gray-600">
                <strong>Description:</strong> {data.description}
              </p>
              <p className="text-gray-600">
                <strong>Targeted Raise:</strong> {Number(data.price).toLocaleString()} MNT
              </p>
              <p className="text-gray-600">
                <strong>Min. Entry:</strong> 2.95 MNT
              </p>
            </div>

            {/* Reasons to Invest */}
            <div className="mt-6 space-y-3">
              <h3 className="font-bold text-lg">Why Invest?</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>High demand in the area for residential properties.</li>
                <li>
                  Expected rise in property value over the next few years.
                </li>
                <li>
                  Environmentally friendly construction with green energy
                  systems.
                </li>
              </ul>
            </div>

            <span className="relative">
              <h1>Price:</h1>
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Price"
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  backgroundColor: "#e5e7eb",
                  padding: "10px 18px",
                  borderRadius: "4px",
                  border: "1px",
                  outline: "none",
                }}
              />
            </span>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-between gap-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                onClick={toggleModal}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-[#24c2a5] text-white rounded-lg hover:bg-[#1da88d]"
                onClick={handleContribute}
                disabled={isContributing || !contributionAmount}
              >
                Confirm Investment
              </button>
            </div>

            {isAvailable && (
              <div className="w-[80%] h-[10rem] absolute top-[15rem] left-[10%] drop-shadow-md rounded-md z-50 bg-[#1da88d] text-white text-xl font-semibold p-4 text-center justify-center flex flex-col">
                <div
                  className="w-[2rem] h-[2rem] rounded-full bg-red-700 text-white font-bold text-2xl flex justify-center items-center mb-[2rem] cursor-pointer"
                  onClick={() => setIsAvailable(false)}
                >
                  X
                </div>
                {!isHome
                  ? "Investment page still under construction 🏗️"
                  : "Please connect wallet"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md h-[auto] overflow-y-auto relative"
            style={{ pointerEvents: "auto" }}
          >
            <h2 className="text-xl font-bold mb-4">{data.title} - Location</h2>
            <div className="h-[400px] w-full mb-4">
              <MapContainer
                center={[data.latitude, data.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[data.latitude, data.longitude]}>
                  <Popup>
                    {data.title}
                    <br />
                    {data.latitude} {data.longitude}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <button
              className="px-4 py-2 bg-[#24c2a5] text-white rounded-lg hover:bg-[#1da88d] w-full"
              onClick={toggleMapModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
