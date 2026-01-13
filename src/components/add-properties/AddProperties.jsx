import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { createProperty } from "../../utils";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "./addproperties.css";
import { uploadFile, uploadPropertyMetadata } from "../../utils/api/files/route";

function AddProperties() {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
	const [cid, setCid] = useState("");
  const [propertytype, setPropertytype] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchControlRef = useRef(null);
  const markerRef = useRef(null);
  const inputFile = useRef(null);

  useEffect(() => {
    if (isMapModalOpen && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [6.8667, 7.3833],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);

      const provider = new OpenStreetMapProvider();
      searchControlRef.current = new GeoSearchControl({
        provider: provider,
        style: "bar",
        showMarker: true,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        keepResult: true,
        searchLabel: "Search for location",
      });

      mapInstanceRef.current.addControl(searchControlRef.current);

      mapInstanceRef.current.on('click', function (e) {
        const latitude = e.latlng.lat.toFixed(6);
        const longitude = e.latlng.lng.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        updateMarker(e.latlng);
      });

      mapInstanceRef.current.on('geosearch/showlocation', function(e) {
        setLat(e.location.y.toFixed(6));
        setLng(e.location.x.toFixed(6));
        updateMarker(e.location);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        if (searchControlRef.current) {
          mapInstanceRef.current.removeControl(searchControlRef.current);
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapModalOpen]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [isMapModalOpen]);

  const updateMarker = (latlng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng).addTo(mapInstanceRef.current);
    }
  };

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    setEndDate(date);
  };

  const handleUpload = async (fileToUpload) => {
    try {
      setUploading(true);
      console.log("🖼️ Initiating image upload for:", fileToUpload.name);
      
      const result = await uploadFile(fileToUpload);
      
      if (result?.cid) {
        setCid(result.cid);
        console.log("✅ Image CID saved to state:", result.cid);
        alert(`Image uploaded successfully!\nCID: ${result.cid.substring(0, 20)}...`);
      } else {
        console.error("❌ Upload returned but no CID!");
        alert("Image upload failed: No CID returned. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert(`Image upload failed: ${error.message}\n\nPlease check your PINATA_JWT token and try again.`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleChange = (e) => {
		setFile(e.target.files[0]);
		handleUpload(e.target.files[0]);
	};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate image was uploaded to IPFS first
    if (!cid) {
      alert("Please upload a property image first. Wait for the upload to complete before submitting.");
      return;
    }

    // Validate CID format (should start with 'baf' or 'Qm')
    if (!cid.startsWith("baf") && !cid.startsWith("Qm")) {
      alert("Invalid image upload. Please re-upload the property image.");
      return;
    }

    const deadlineTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload all property metadata to IPFS first
      console.log("Step 1: Uploading property metadata to IPFS...");
      const metadata = {
        title,
        description,
        propertyType: propertytype,
        imageCid: cid,
        price: Number(price),
        latitude: lat,
        longitude: lng,
        createdAt: Date.now(),
      };
      
      const metadataResult = await uploadPropertyMetadata(metadata);
      console.log("Metadata pinned to IPFS with CID:", metadataResult.cid);

      // Step 2: Create property on-chain with the image CID
      console.log("Step 2: Creating property on blockchain...");
      console.log("   Title:", title);
      console.log("   Property Type:", propertytype);
      console.log("   Image CID:", cid);
      
      const txHash = await createProperty(
        title,
        description,
        propertytype,  // propertyType comes BEFORE image
        cid,           // Image CID for on-chain storage
        price,
        deadlineTimestamp,
        lat,
        lng
      );

      console.log("Property created successfully!");
      console.log("- Metadata CID:", metadataResult.cid);
      console.log("- Transaction hash:", txHash);
      
      navigate('/app/explore-properties');
    } catch (error) {
      console.error('Error creating property:', error);
      alert("Error creating property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="add-properties-wrapper">
      <div className="add-properties">
        <div className="sub-head">
          <h1>Explore land</h1>
          <h3>
            Graso <span className="arrow"></span> {" > "}{" "}
            <span>Add properties</span>
          </h3>
        </div>

        <div className="input-container">
          <div className="input-box input-box1">
            <h1>
              Upload your property image here, please click {"Upload Image"}
              Button.
            </h1>
            <input
              type="file"
              ref={inputFile}
              className="image-input"
              accept="image/png, image/jpeg"
              placeholder="Supports JPG, PNG, Max file size: 10MB"
              onChange={handleChange}
              required
            />
            <button onClick={() => inputFile.current.click()}>
              
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>

          <div className="input-box input-box2">
            <form onSubmit={handleSubmit}>
              <span className="coordinates">
                <h1>Title:</h1>
                <input
                  type="text"
                  placeholder="Property Title:"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </span>

              <span className="coordinates">
                <h1>Select property:</h1>
                <select
                  value={description}
                  onChange={(e) => setPropertytype(e.target.value)}
                  required
                >
                  <option value="">Select Property</option>
                  <option value="land">Land</option>
                  <option value="landedProperty">Landed Property</option>
                </select>
              </span>

              <span className="coordinates">
                <h1>Price (MNT):</h1>
                <input
                  type="number"
                  placeholder="Price in MNT"
                  value={price || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0 || e.target.value === "") {
                      setPrice(e.target.value === "" ? "" : value);
                    }
                  }}
                  required
                />
              </span>

              <span className="coordinates">
                <h1>Description</h1>
                <textarea name="description" id="description" cols="30" rows="5" onChange={(e) => setDescription(e.target.value) }></textarea>
                </span>


              <span className="coordinates">
                <h1>Start Date:</h1>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  required
                />
              </span>

              <span className="coordinates">
                <h1>End Date:</h1>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  required
                />
              </span>

              <div className="coordinates">
                <h1>Property Location:</h1>
                <button type="button" onClick={() => setIsMapModalOpen(true)}>Open Map</button>
                <div className="coordinates-input">
                  <div className="coordinates">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Click on the map"
                      readOnly
                      required
                    />
                  </div>
                  <div className="coordinates">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Click on the map"
                      readOnly
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Add Property"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isMapModalOpen && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button onClick={() => setIsMapModalOpen(false)}>Close Map</button>
            <div ref={mapRef} style={{ height: "400px", width: "100%" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProperties;
