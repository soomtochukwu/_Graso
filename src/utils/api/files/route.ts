/// <reference types="vite/client" />
/**
 * Pinata File Upload & Gateway Utilities
 *
 * Simple utilities for uploading files to IPFS via Pinata and generating gateway URLs.
 */
import { pinata } from "../../config";

/**
 * Upload a file to Pinata IPFS (public network)
 *
 * @param file - The File object to upload (from file input or drag-drop)
 * @returns Upload result containing the CID and file metadata
 * @throws Error if upload fails
 *
 * @example
 * const result = await uploadFile(fileInput.files[0]);
 * console.log(result.cid); // "bafkreiab..."
 */
export async function uploadFile(file: File) {
  try {
    console.log("📤 Starting image upload to IPFS...");
    console.log("   File name:", file.name);
    console.log("   File size:", (file.size / 1024).toFixed(2), "KB");
    console.log("   File type:", file.type);

    const result = await pinata.upload.public.file(file);
    
    console.log("✅ Image uploaded successfully to IPFS!");
    console.log("   Image CID:", result.cid);
    console.log("   File ID:", result.id);
    
    return {
      success: true,
      cid: result.cid,
      id: result.id,
      name: result.name,
      size: result.size,
    };
  } catch (error) {
    console.error("❌ Pinata image upload FAILED:", error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Convert a CID to a full gateway URL for displaying images
 *
 * @param cid - The IPFS Content Identifier (CID) of the file
 * @returns Full gateway URL string for the file, or empty string if invalid
 *
 * @example
 * const url = getImageUrl("bafkreiab...");
 * // Returns: "https://gateway.pinata.cloud/ipfs/bafkreiab..."
 */
export function getImageUrl(cid: string): string {
  // Return empty if no CID provided
  if (!cid) return "";

  // Validate CID format (IPFS CIDs start with 'bafy', 'bafk', or 'Qm')
  const isValidCid = cid.startsWith("baf") || cid.startsWith("Qm");
  if (!isValidCid) {
    console.warn(`Invalid IPFS CID: "${cid}". Expected format starting with 'baf' or 'Qm'.`);
    return "";
  }

  // Use configured gateway or fallback to public Pinata gateway
  const gateway = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";
  return `https://${gateway}/ipfs/${cid}`;
}

/**
 * Property metadata interface for IPFS upload
 */
export interface PropertyMetadata {
  title: string;
  description: string;
  propertyType: string;
  imageCid: string;
  price: number;
  latitude: string;
  longitude: string;
  createdAt: number;
}

/**
 * Upload JSON metadata to Pinata IPFS
 *
 * @param metadata - Property metadata object to upload
 * @returns Upload result containing the metadata CID
 * @throws Error if upload fails
 *
 * @example
 * const result = await uploadPropertyMetadata({ title: "...", ... });
 * console.log(result.cid); // "bafkreiab..."
 */
export async function uploadPropertyMetadata(metadata: PropertyMetadata) {
  try {
    console.log("Uploading property metadata to IPFS...", metadata);
    const result = await pinata.upload.public.json(metadata);
    console.log("Metadata uploaded successfully, CID:", result.cid);
    return {
      success: true,
      cid: result.cid,
      id: result.id,
    };
  } catch (error) {
    console.error("Pinata JSON upload error:", error);
    throw new Error(
      `Failed to upload metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
