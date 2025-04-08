"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useFurniture } from "../context/FurnitureContext"
import { ViewMode, FurnitureType } from "../types"

interface ControlPanelProps {
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode) => void
}

export default function ControlPanel({ viewMode, onChangeViewMode }: ControlPanelProps) {
  const {
    room,
    setRoom,
    selectedId,
    furniture,
    addFurniture,
    removeFurniture,
    updateFurnitureColor,
    updateFurnitureRotation,
    updateFurnitureScale,
    saveDesign,
    savedDesigns,
    snapshots,
    captureSnapshot,
  } = useFurniture()

  const [designName, setDesignName] = useState("")
  const [showSavedDesigns, setShowSavedDesigns] = useState(false)
  const [showSnapshots, setShowSnapshots] = useState(false)

  // Refs for file inputs
  const wallTextureInputRef = useRef<HTMLInputElement>(null)
  const floorTextureInputRef = useRef<HTMLInputElement>(null)

  const selectedItem = furniture.find((item) => item.id === selectedId)

  const handleAddFurniture = (type: FurnitureType) => {
    addFurniture(type)
  }

  const handleSaveDesign = () => {
    if (designName) {
      saveDesign(designName)
      setDesignName("")
    }
  }

  const handleRotateItem = (degrees: number) => {
    if (selectedItem) {
      // Convert degrees to radians and add to current Y rotation
      const currentYRotation = selectedItem.rotation[1]
      const newRotation: [number, number, number] = [
        selectedItem.rotation[0],
        currentYRotation + (degrees * Math.PI) / 180,
        selectedItem.rotation[2],
      ]
      updateFurnitureRotation(selectedItem.id, newRotation)
    }
  }

  const handleScaleChange = (axis: "x" | "y" | "z", value: number) => {
    if (selectedItem) {
      const newScale = [...selectedItem.scale] as [number, number, number]

      switch (axis) {
        case "x":
          newScale[0] = value
          break
        case "y":
          newScale[1] = value
          break
        case "z":
          newScale[2] = value
          break
      }

      updateFurnitureScale(selectedItem.id, newScale)
    }
  }

  const handleUniformScale = (value: number) => {
    if (selectedItem) {
      updateFurnitureScale(selectedItem.id, [value, value, value])
    }
  }

  // Handle texture file uploads
  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>, textureType: "wall" | "floor") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Revoke any existing object URL to prevent memory leaks
    if (textureType === "wall" && room.wallTexture.url) {
      URL.revokeObjectURL(room.wallTexture.url)
    } else if (textureType === "floor" && room.floorTexture.url) {
      URL.revokeObjectURL(room.floorTexture.url)
    }

    // Create a URL for the uploaded file
    const textureUrl = URL.createObjectURL(file)

    console.log(`Uploading ${textureType} texture:`, textureUrl)

    // Update the room state with the new texture
    if (textureType === "wall") {
      setRoom({
        ...room,
        wallTexture: {
          ...room.wallTexture,
          url: textureUrl,
        },
      })
    } else {
      setRoom({
        ...room,
        floorTexture: {
          ...room.floorTexture,
          url: textureUrl,
        },
      })
    }
  }

  // Clear texture
  const handleClearTexture = (textureType: "wall" | "floor") => {
    if (textureType === "wall" && room.wallTexture.url) {
      URL.revokeObjectURL(room.wallTexture.url)
      setRoom({
        ...room,
        wallTexture: {
          ...room.wallTexture,
          url: null,
        },
      })
    } else if (textureType === "floor" && room.floorTexture.url) {
      URL.revokeObjectURL(room.floorTexture.url)
      setRoom({
        ...room,
        floorTexture: {
          ...room.floorTexture,
          url: null,
        },
      })
    }
  }

  const handleTextureRepeatChange = (textureType: "wall" | "floor", axis: "x" | "y", value: number) => {
    setRoom((prevRoom) => {
      const updatedTexture = { ...prevRoom[textureType === "wall" ? "wallTexture" : "floorTexture"] }
      updatedTexture.repeat = {
        ...updatedTexture.repeat,
        [axis === "x" ? 0 : 1]: value,
      }

      return {
        ...prevRoom,
        [textureType === "wall" ? "wallTexture" : "floorTexture"]: updatedTexture,
      }
    })
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        position: "absolute",
        right: 0,
        top: 0,
      }}
    >
      <h2 style={{ margin: "0 0 20px", color: "#333" }}>Furniture Visualizer</h2>

      {/* View controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>View Mode</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {Object.values(ViewMode).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeViewMode(mode)}
              style={{
                padding: "8px 16px",
                backgroundColor: viewMode === mode ? "#4285F4" : "#f0f0f0",
                color: viewMode === mode ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Room settings */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Room Settings</h3>

        {/* Room dimensions */}
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Dimensions</h4>
          <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Width (m)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={room.width}
                onChange={(e) => setRoom({ ...room, width: Number(e.target.value) })}
                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Length (m)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={room.length}
                onChange={(e) => setRoom({ ...room, length: Number(e.target.value) })}
                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Height (m)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={room.height}
                onChange={(e) => setRoom({ ...room, height: Number(e.target.value) })}
                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
          </div>
        </div>

        {/* Wall settings */}
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Wall</h4>

          {/* Wall color */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Color</label>
            <input
              type="color"
              value={room.wallColor}
              onChange={(e) => setRoom({ ...room, wallColor: e.target.value })}
              style={{ width: "100%", height: "32px" }}
            />
          </div>

          {/* Wall texture */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Texture</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <button onClick={() => wallTextureInputRef.current?.click()} style={{ ...buttonStyle, flex: 1 }}>
                Upload Texture
              </button>
              <button
                onClick={() => handleClearTexture("wall")}
                style={{ ...buttonStyle, backgroundColor: "#f44336" }}
                disabled={!room.wallTexture.url}
              >
                Clear
              </button>
              <input
                type="file"
                ref={wallTextureInputRef}
                onChange={(e) => handleTextureUpload(e, "wall")}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            {room.wallTexture.url && (
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <img
                    src={room.wallTexture.url || "/placeholder.svg"}
                    alt="Wall texture preview"
                    style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                  />
                </div>

                {/* Texture repeat controls */}
                <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                      Repeat X: {room.wallTexture.repeat[0]}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={room.wallTexture.repeat[0]}
                      onChange={(e) => handleTextureRepeatChange("wall", "x", Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                      Repeat Y: {room.wallTexture.repeat[1]}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={room.wallTexture.repeat[1]}
                      onChange={(e) => handleTextureRepeatChange("wall", "y", Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floor settings */}
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Floor</h4>

          {/* Floor color */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Color</label>
            <input
              type="color"
              value={room.floorColor}
              onChange={(e) => setRoom({ ...room, floorColor: e.target.value })}
              style={{ width: "100%", height: "32px" }}
            />
          </div>

          {/* Floor texture */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Texture</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <button onClick={() => floorTextureInputRef.current?.click()} style={{ ...buttonStyle, flex: 1 }}>
                Upload Texture
              </button>
              <button
                onClick={() => handleClearTexture("floor")}
                style={{ ...buttonStyle, backgroundColor: "#f44336" }}
                disabled={!room.floorTexture.url}
              >
                Clear
              </button>
              <input
                type="file"
                ref={floorTextureInputRef}
                onChange={(e) => handleTextureUpload(e, "floor")}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            {room.floorTexture.url && (
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <img
                    src={room.floorTexture.url || "/placeholder.svg"}
                    alt="Floor texture preview"
                    style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                  />
                </div>

                {/* Texture repeat controls */}
                <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                      Repeat X: {room.floorTexture.repeat[0]}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={room.floorTexture.repeat[0]}
                      onChange={(e) => handleTextureRepeatChange("floor", "x", Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                      Repeat Y: {room.floorTexture.repeat[1]}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={room.floorTexture.repeat[1]}
                      onChange={(e) => handleTextureRepeatChange("floor", "y", Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add furniture */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Add Furniture</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button onClick={() => handleAddFurniture(FurnitureType.CHAIR)} style={buttonStyle}>
            Add Chair
          </button>
          <button onClick={() => handleAddFurniture(FurnitureType.DINING_TABLE)} style={buttonStyle}>
            Add Dining Table
          </button>
          <button onClick={() => handleAddFurniture(FurnitureType.SIDE_TABLE)} style={buttonStyle}>
            Add Side Table
          </button>
        </div>
      </div>

      {/* Selected item controls */}
      {selectedItem && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Selected Item</h3>

          {/* Color control */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Color</h4>
            <input
              type="color"
              value={selectedItem.color}
              onChange={(e) => updateFurnitureColor(selectedItem.id, e.target.value)}
              style={{ width: "100%", height: "32px" }}
            />
          </div>

          {/* Rotation control */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Rotation</h4>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => handleRotateItem(-45)} style={{ ...buttonStyle, flex: 1, padding: "6px" }}>
                -45°
              </button>
              <button onClick={() => handleRotateItem(-15)} style={{ ...buttonStyle, flex: 1, padding: "6px" }}>
                -15°
              </button>
              <button onClick={() => handleRotateItem(15)} style={{ ...buttonStyle, flex: 1, padding: "6px" }}>
                +15°
              </button>
              <button onClick={() => handleRotateItem(45)} style={{ ...buttonStyle, flex: 1, padding: "6px" }}>
                +45°
              </button>
            </div>
          </div>

          {/* Scale control */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Scale</h4>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                Uniform Scale: {selectedItem.scale[0].toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={selectedItem.scale[0]}
                onChange={(e) => handleUniformScale(Number.parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <button
            onClick={() => removeFurniture(selectedItem.id)}
            style={{ ...buttonStyle, backgroundColor: "#f44336", marginTop: "10px" }}
          >
            Remove Item
          </button>
        </div>
      )}

      {/* Snapshots */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "18px", margin: 0 }}>Snapshots</h3>
          <button onClick={() => setShowSnapshots(!showSnapshots)} style={{ ...buttonStyle, padding: "4px 8px" }}>
            {showSnapshots ? "Hide" : "Show"}
          </button>
        </div>

        <button onClick={() => captureSnapshot("")} style={buttonStyle}>
          Capture Snapshot
        </button>

        {showSnapshots && snapshots.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: "4px",
              padding: "10px",
            }}
          >
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}
              >
                <img
                  src={snapshot.imageData || "/placeholder.svg"}
                  alt={`Snapshot ${snapshot.id}`}
                  style={{ width: "100%", height: "auto", borderRadius: "4px", cursor: "pointer" }}
                />
                <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  {new Date(snapshot.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save design */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Save Design</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Design name"
            style={{ flex: 1, padding: "8px" }}
          />
          <button onClick={handleSaveDesign} style={buttonStyle}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#4285F4",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
}

