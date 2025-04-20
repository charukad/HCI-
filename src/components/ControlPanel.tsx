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
  const [activeTab, setActiveTab] = useState("furniture") // Default tab

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "furniture":
        return (
          <>
            {/* Add furniture */}
            <div className="tab-section">
              <h3>Add Furniture</h3>
              <div className="button-grid">
                <button onClick={() => handleAddFurniture(FurnitureType.SOFA)} className="furniture-button">
                  <div className="icon">🛋️</div>
                  <span>Sofa</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.ARMCHAIR)} className="furniture-button">
                  <div className="icon">🪑</div>
                  <span>Armchair</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.COFFEE_TABLE)} className="furniture-button">
                  <div className="icon">🪵</div>
                  <span>Coffee Table</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.TV_STAND)} className="furniture-button">
                  <div className="icon">📺</div>
                  <span>TV Stand</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.PLANT)} className="furniture-button">
                  <div className="icon">🪴</div>
                  <span>Plant</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.LAMP)} className="furniture-button">
                  <div className="icon">💡</div>
                  <span>Lamp</span>
                </button>
              </div>
            </div>

            {/* Selected item controls */}
            {selectedItem && (
              <div className="tab-section">
                <h3>Selected Item: {selectedItem.type}</h3>

                {/* Color control */}
                <div className="control-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={selectedItem.color}
                    onChange={(e) => updateFurnitureColor(selectedItem.id, e.target.value)}
                    className="color-picker"
                  />
                </div>

                {/* Rotation control */}
                <div className="control-group">
                  <label>Rotation</label>
                  <div className="button-row">
                    <button onClick={() => handleRotateItem(-45)} className="control-button">
                      -45°
                    </button>
                    <button onClick={() => handleRotateItem(-15)} className="control-button">
                      -15°
                    </button>
                    <button onClick={() => handleRotateItem(15)} className="control-button">
                      +15°
                    </button>
                    <button onClick={() => handleRotateItem(45)} className="control-button">
                      +45°
                    </button>
                  </div>
                </div>

                {/* Scale control */}
                <div className="control-group">
                  <label>Scale: {selectedItem.scale[0].toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={selectedItem.scale[0]}
                    onChange={(e) => handleUniformScale(Number.parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>

                <button
                  onClick={() => removeFurniture(selectedItem.id)}
                  className="danger-button"
                >
                  Remove Item
                </button>
              </div>
            )}
          </>
        )

      case "room":
        return (
          <>
            {/* Room dimensions */}
            <div className="tab-section">
              <h3>Room Dimensions</h3>
              <div className="control-grid">
                <div className="control-group">
                  <label>Width (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={room.width}
                    onChange={(e) => setRoom({ ...room, width: Number(e.target.value) })}
                    className="text-input"
                  />
                </div>
                <div className="control-group">
                  <label>Length (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={room.length}
                    onChange={(e) => setRoom({ ...room, length: Number(e.target.value) })}
                    className="text-input"
                  />
                </div>
                <div className="control-group">
                  <label>Height (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={room.height}
                    onChange={(e) => setRoom({ ...room, height: Number(e.target.value) })}
                    className="text-input"
                  />
                </div>
              </div>
            </div>

            {/* Wall settings */}
            <div className="tab-section">
              <h3>Wall</h3>
              <div className="control-group">
                <label>Color</label>
                <input
                  type="color"
                  value={room.wallColor}
                  onChange={(e) => setRoom({ ...room, wallColor: e.target.value })}
                  className="color-picker"
                />
              </div>

              {/* Wall texture */}
              <div className="control-group">
                <label>Texture</label>
                <div className="button-row">
                  <button onClick={() => wallTextureInputRef.current?.click()} className="primary-button">
                    Upload Texture
                  </button>
                  <button
                    onClick={() => handleClearTexture("wall")}
                    className="secondary-button"
                    disabled={!room.wallTexture.url}
                  >
                    Clear
                  </button>
                </div>
                <input
                  type="file"
                  ref={wallTextureInputRef}
                  onChange={(e) => handleTextureUpload(e, "wall")}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                {room.wallTexture.url && (
                  <div className="texture-preview">
                    <div className="preview-image">
                      <img
                        src={room.wallTexture.url}
                        alt="Wall texture preview"
                      />
                    </div>

                    {/* Texture repeat controls */}
                    <div className="control-grid">
                      <div className="control-group">
                        <label>Repeat X: {room.wallTexture.repeat[0]}</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={room.wallTexture.repeat[0]}
                          onChange={(e) => handleTextureRepeatChange("wall", "x", Number(e.target.value))}
                          className="slider"
                        />
                      </div>
                      <div className="control-group">
                        <label>Repeat Y: {room.wallTexture.repeat[1]}</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={room.wallTexture.repeat[1]}
                          onChange={(e) => handleTextureRepeatChange("wall", "y", Number(e.target.value))}
                          className="slider"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floor settings */}
            <div className="tab-section">
              <h3>Floor</h3>
              <div className="control-group">
                <label>Color</label>
                <input
                  type="color"
                  value={room.floorColor}
                  onChange={(e) => setRoom({ ...room, floorColor: e.target.value })}
                  className="color-picker"
                />
              </div>

              {/* Floor texture */}
              <div className="control-group">
                <label>Texture</label>
                <div className="button-row">
                  <button onClick={() => floorTextureInputRef.current?.click()} className="primary-button">
                    Upload Texture
                  </button>
                  <button
                    onClick={() => handleClearTexture("floor")}
                    className="secondary-button"
                    disabled={!room.floorTexture.url}
                  >
                    Clear
                  </button>
                </div>
                <input
                  type="file"
                  ref={floorTextureInputRef}
                  onChange={(e) => handleTextureUpload(e, "floor")}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                {room.floorTexture.url && (
                  <div className="texture-preview">
                    <div className="preview-image">
                      <img
                        src={room.floorTexture.url}
                        alt="Floor texture preview"
                      />
                    </div>

                    {/* Texture repeat controls */}
                    <div className="control-grid">
                      <div className="control-group">
                        <label>Repeat X: {room.floorTexture.repeat[0]}</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={room.floorTexture.repeat[0]}
                          onChange={(e) => handleTextureRepeatChange("floor", "x", Number(e.target.value))}
                          className="slider"
                        />
                      </div>
                      <div className="control-group">
                        <label>Repeat Y: {room.floorTexture.repeat[1]}</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={room.floorTexture.repeat[1]}
                          onChange={(e) => handleTextureRepeatChange("floor", "y", Number(e.target.value))}
                          className="slider"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )

      case "view":
        return (
          <>
            <div className="tab-section">
              <h3>View Mode</h3>
              <div className="button-row view-buttons">
                {Object.values(ViewMode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeViewMode(mode)}
                    className={`view-button ${viewMode === mode ? "active" : ""}`}
                  >
                    {mode === ViewMode.ThreeD ? "3D View" : "Top Down View"}
                  </button>
                ))}
              </div>
            </div>

            <div className="tab-section">
              <div className="header-with-button">
                <h3>Snapshots</h3>
                <button
                  onClick={() => setShowSnapshots(!showSnapshots)}
                  className="small-button"
                >
                  {showSnapshots ? "Hide" : "Show"}
                </button>
              </div>

              <button onClick={() => captureSnapshot("")} className="primary-button full-width">
                Capture Snapshot
              </button>

              {showSnapshots && snapshots.length > 0 && (
                <div className="snapshots-container">
                  {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="snapshot-item">
                      <img
                        src={snapshot.imageData || "/placeholder.svg"}
                        alt={`Snapshot ${snapshot.id}`}
                      />
                      <div className="snapshot-timestamp">
                        {new Date(snapshot.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )

      case "save":
        return (
          <>
            <div className="tab-section">
              <h3>Save Design</h3>
              <div className="control-group">
                <label>Design Name</label>
                <div className="save-design-container">
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Enter design name"
                    className="text-input"
                  />
                  <button onClick={handleSaveDesign} className="primary-button" disabled={!designName}>
                    Save
                  </button>
                </div>
              </div>

              <div className="header-with-button">
                <h3>Saved Designs</h3>
                <button
                  onClick={() => setShowSavedDesigns(!showSavedDesigns)}
                  className="small-button"
                >
                  {showSavedDesigns ? "Hide" : "Show"}
                </button>
              </div>

              {showSavedDesigns && savedDesigns.length > 0 && (
                <div className="saved-designs-list">
                  {savedDesigns.map((design) => (
                    <div key={design.id} className="saved-design-item">
                      <div className="saved-design-name">{design.name}</div>
                      <div className="saved-design-date">
                        {new Date(parseInt(design.id)).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSavedDesigns && savedDesigns.length === 0 && (
                <div className="empty-state">No saved designs yet</div>
              )}
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h2>Room Designer</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "furniture" ? "active" : ""}`}
          onClick={() => setActiveTab("furniture")}
        >
          Furniture
        </button>
        <button
          className={`tab ${activeTab === "room" ? "active" : ""}`}
          onClick={() => setActiveTab("room")}
        >
          Room
        </button>
        <button
          className={`tab ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View
        </button>
        <button
          className={`tab ${activeTab === "save" ? "active" : ""}`}
          onClick={() => setActiveTab("save")}
        >
          Save
        </button>
      </div>

      <div className="panel-content">
        {renderTabContent()}
      </div>

      <style jsx>{`
        .control-panel {
          width: 100%;
          height: 100vh;
          background-color: #fff;
          box-shadow: -5px 0 15px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: absolute;
          right: 0;
          top: 0;
          font-family: 'Inter', sans-serif;
        }

        .panel-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .panel-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #eee;
        }

        .tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
          position: relative;
          transition: all 0.2s;
        }

        .tab:hover {
          background-color: #f9f9f9;
        }

        .tab.active {
          color: #4285F4;
          font-weight: 600;
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #4285F4;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .tab-section {
          margin-bottom: 30px;
        }

        .tab-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group label {
          display: block;
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 6px;
        }

        .color-picker {
          width: 100%;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
        }

        .text-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .slider {
          width: 100%;
          height: 6px;
          appearance: none;
          background: #eee;
          outline: none;
          border-radius: 3px;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: #4285F4;
          border-radius: 50%;
          cursor: pointer;
        }

        .control-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .furniture-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 8px;
          background-color: #f9f9f9;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .furniture-button:hover {
          background-color: #f0f0f0;
          border-color: #ddd;
          transform: translateY(-2px);
        }

        .furniture-button .icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .primary-button {
          padding: 10px 16px;
          background-color: #4285F4;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .primary-button:hover {
          background-color: #3367d6;
        }

        .primary-button:disabled {
          background-color: #a1c0fa;
          cursor: not-allowed;
        }

        .secondary-button {
          padding: 10px 16px;
          background-color: #f1f3f4;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .secondary-button:hover {
          background-color: #e8eaed;
        }

        .secondary-button:disabled {
          background-color: #f1f3f4;
          color: #999;
          cursor: not-allowed;
        }

        .danger-button {
          padding: 10px 16px;
          background-color: #ea4335;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
          margin-top: 8px;
          transition: background-color 0.2s;
        }

        .danger-button:hover {
          background-color: #d33426;
        }

        .full-width {
          width: 100%;
        }

        .texture-preview {
          margin-top: 12px;
        }

        .preview-image {
          width: 100%;
          height: 80px;
          overflow: hidden;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-with-button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        .header-with-button h3 {
          margin: 0;
          padding: 0;
          border: none;
        }

        .small-button {
          padding: 4px 8px;
          background-color: #f1f3f4;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .snapshots-container {
          max-height: 250px;
          overflow-y: auto;
          margin-top: 12px;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 8px;
        }

        .snapshot-item {
          margin-bottom: 12px;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }

        .snapshot-item:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }

        .snapshot-item img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          cursor: pointer;
        }

        .snapshot-timestamp {
          font-size: 0.8rem;
          color: #666;
          margin-top: 4px;
        }

        .save-design-container {
          display: flex;
          gap: 8px;
        }

        .save-design-container input {
          flex: 1;
        }

        .saved-designs-list {
          margin-top: 12px;
          border: 1px solid #eee;
          border-radius: 6px;
          overflow: hidden;
        }

        .saved-design-item {
          padding: 12px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .saved-design-item:last-child {
          border-bottom: none;
        }

        .saved-design-item:hover {
          background-color: #f9f9f9;
        }

        .saved-design-name {
          font-weight: 500;
          color: #333;
        }

        .saved-design-date {
          font-size: 0.8rem;
          color: #666;
        }

        .empty-state {
          padding: 20px;
          text-align: center;
          color: #666;
          font-style: italic;
          background-color: #f9f9f9;
          border-radius: 6px;
        }

        .view-buttons {
          margin-bottom: 16px;
        }

        .view-button {
          flex: 1;
          padding: 12px 16px;
          background-color: #f1f3f4;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-button.active {
          background-color: #4285F4;
          color: white;
          border-color: #4285F4;
        }
      `}</style>
    </div>
  )
}