"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useFurniture } from "../context/FurnitureContext"
import { ViewMode, FurnitureType, type Room } from "../types"

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
    updateFurnitureMaterial,
    updateFurnitureTexture,
    updateFurnitureFinish,
    updateLampIntensity,
    updateLampColor,
    applyRoomPreset,
    applyColorScheme,
    saveDesign,
    savedDesigns,
    snapshots,
    captureSnapshot,
    importCustomModel,
    setSelectedId
  } = useFurniture()

  const [designName, setDesignName] = useState("")
  const [showSavedDesigns, setShowSavedDesigns] = useState(false)
  const [showSnapshots, setShowSnapshots] = useState(false)
  const [activeTab, setActiveTab] = useState("furniture") // Default tab
  const [activeMaterialType, setActiveMaterialType] = useState("fabric")
  const [activeTexture, setActiveTexture] = useState("solid")

  // For custom model tab
  const [customModelFile, setCustomModelFile] = useState<File | null>(null)
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null)
  const [customModelPreview, setCustomModelPreview] = useState<string | null>(null)
  const [customModelName, setCustomModelName] = useState("")
  const [customModelDimensions, setCustomModelDimensions] = useState({ width: 1.0, depth: 1.0, height: 1.0 })
  const [customModels, setCustomModels] = useState<Array<{ id: string, name: string, url: string }>>([])

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

  // Handle model file upload
  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if the file is a GLB or GLTF
    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      alert('Please upload a GLB or GLTF file')
      return
    }

    // Create a URL for the uploaded file
    const modelUrl = URL.createObjectURL(file)
    
    setCustomModelFile(file)
    setCustomModelUrl(modelUrl)
    setCustomModelPreview(modelUrl) // In a real app, you might generate a thumbnail
    setCustomModelName(file.name.split('.')[0]) // Default name from filename
  }

  // Handle adding the custom model to the scene
  const handleAddCustomModel = () => {
    if (!customModelUrl || !customModelName) return
    
    // Create a custom model using the context function
    const modelId = importCustomModel(
      customModelUrl,
      customModelName,
      customModelDimensions
    )
    
    // Add to list of custom models for reuse
    setCustomModels([
      ...customModels,
      { 
        id: modelId, 
        name: customModelName, 
        url: customModelUrl 
      }
    ])
    
    // Reset form
    setCustomModelName("")
    setCustomModelPreview(null)
    // Don't revoke the URL as it's still needed by the model
    
    // Select the newly added model
    setSelectedId(modelId)
    
    // Switch to furniture tab to manipulate the newly added model
    setActiveTab("furniture")
  }

  // Handle selecting a previously imported custom model
  const handleSelectCustomModel = (modelId: string) => {
    const model = customModels.find(m => m.id === modelId)
    if (!model) return
    
    // Create a new instance of a previously imported model
    const newId = importCustomModel(
      model.url,
      model.name,
      customModelDimensions
    )
    
    // Select the newly added model
    setSelectedId(newId)
    
    // Switch to furniture tab to manipulate the newly added model
    setActiveTab("furniture")
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
    const updatedRoom = { ...room };
    const updatedTexture = { ...updatedRoom[textureType === "wall" ? "wallTexture" : "floorTexture"] };
    
    updatedTexture.repeat = [
      axis === "x" ? value : updatedTexture.repeat[0],
      axis === "y" ? value : updatedTexture.repeat[1],
    ];
    
    updatedRoom[textureType === "wall" ? "wallTexture" : "floorTexture"] = updatedTexture;
    setRoom(updatedRoom);
  }

  const handleLightingChange = (property: string, value: any) => {
    const updatedRoom = { ...room };
    
    // Type-safe property access
    switch (property) {
      case 'ambientLightIntensity':
        updatedRoom.ambientLightIntensity = value;
        break;
      case 'mainLightColor':
        updatedRoom.mainLightColor = value;
        break;
      case 'timeOfDay':
        updatedRoom.timeOfDay = value;
        break;
    }
    
    setRoom(updatedRoom);
  }
  
  const handleMaterialChange = (id: string, material: string) => {
    setActiveMaterialType(material);
    updateFurnitureMaterial(id, material);
  }
  
  const handleTextureChange = (id: string, texture: string) => {
    setActiveTexture(texture);
    updateFurnitureTexture(id, texture);
  }
  
  const handleApplyPreset = (preset: string) => {
    applyRoomPreset(preset);
  }
  
  const handleApplyColorScheme = (scheme: string) => {
    const schemes: { [key: string]: string[] } = {
      'neutral': ['#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E'],
      'warm': ['#FFF8E1', '#FFE0B2', '#FFCC80', '#FFB74D'],
      'cool': ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7'],
      'elegant': ['#FAFAFA', '#212121', '#616161', '#757575'],
      'natural': ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F'],
    };
    
    applyColorScheme(scheme, schemes[scheme] || schemes['neutral']);
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
                <button onClick={() => handleAddFurniture(FurnitureType.BOOKSHELF)} className="furniture-button">
                  <div className="icon">📚</div>
                  <span>Bookshelf</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.RUG)} className="furniture-button">
                  <div className="icon">🧩</div>
                  <span>Rug</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.WALL_ART)} className="furniture-button">
                  <div className="icon">🖼️</div>
                  <span>Wall Art</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.BED)} className="furniture-button">
                  <div className="icon">🛏️</div>
                  <span>Bed</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.DINING_TABLE)} className="furniture-button">
                  <div className="icon">🍽️</div>
                  <span>Dining Table</span>
                </button>
                <button onClick={() => handleAddFurniture(FurnitureType.DINING_CHAIR)} className="furniture-button">
                  <div className="icon">🪑</div>
                  <span>Dining Chair</span>
                </button>
              </div>
            </div>

            {/* Selected item controls */}
            {selectedItem && (
              <div className="tab-section">
                <h3>Selected Item: {selectedItem.type === FurnitureType.CUSTOM_MODEL ? (selectedItem.modelName || "Custom Model") : selectedItem.type}</h3>

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

                {/* Material type selector (for applicable furniture) */}
                {selectedItem.type !== FurnitureType.PLANT && 
                 selectedItem.type !== FurnitureType.RUG && 
                 selectedItem.type !== FurnitureType.CUSTOM_MODEL && (
                  <div className="control-group">
                    <label>Material</label>
                    <div className="button-row">
                      {['fabric', 'leather', 'wood', 'metal', 'glass'].map((material) => (
                        <button
                          key={material}
                          onClick={() => handleMaterialChange(selectedItem.id, material)}
                          className={`control-button ${selectedItem.materialType === material || (!selectedItem.materialType && material === activeMaterialType) ? 'active' : ''}`}
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wood texture selector (for wood material) */}
                {selectedItem.materialType === 'wood' && (
                  <div className="control-group">
                    <label>Wood Type</label>
                    <div className="texture-grid">
                      {['oak', 'walnut', 'pine', 'mahogany'].map((wood) => (
                        <button
                          key={wood}
                          onClick={() => handleTextureChange(selectedItem.id, wood)}
                          className={`texture-button ${selectedItem.texture === wood ? 'active' : ''}`}
                        >
                          <div className={`texture-swatch ${wood}`}></div>
                          <span>{wood}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fabric patterns (for fabric/upholstery) */}
                {selectedItem.materialType === 'fabric' && (
                  <div className="control-group">
                    <label>Pattern</label>
                    <div className="button-row">
                      {['solid', 'striped', 'geometric', 'floral'].map((pattern) => (
                        <button
                          key={pattern}
                          onClick={() => handleTextureChange(selectedItem.id, pattern)}
                          className={`control-button ${selectedItem.texture === pattern || (!selectedItem.texture && pattern === activeTexture) ? 'active' : ''}`}
                        >
                          {pattern}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finish type for metal/glass */}
                {(selectedItem.materialType === 'metal' || selectedItem.materialType === 'glass') && (
                  <div className="control-group">
                    <label>Finish</label>
                    <div className="button-row">
                      {['matte', 'glossy', 'brushed', 'polished'].map((finish) => (
                        <button
                          key={finish}
                          onClick={() => updateFurnitureFinish(selectedItem.id, finish)}
                          className={`control-button ${selectedItem.finish === finish ? 'active' : ''}`}
                        >
                          {finish}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lamp specific controls */}
                {selectedItem.type === FurnitureType.LAMP && (
                  <>
                    <div className="control-group">
                      <label>Light Intensity: {selectedItem.lightIntensity || 0.5}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedItem.lightIntensity || 0.5}
                        onChange={(e) => updateLampIntensity(selectedItem.id, parseFloat(e.target.value))}
                        className="slider"
                      />
                    </div>
                    <div className="control-group">
                      <label>Light Color</label>
                      <input
                        type="color"
                        value={selectedItem.lightColor || "#FFF5E0"}
                        onChange={(e) => updateLampColor(selectedItem.id, e.target.value)}
                        className="color-picker"
                      />
                    </div>
                  </>
                )}

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

            {/* Room presets */}
            <div className="tab-section">
              <h3>Room Presets</h3>
              <div className="preset-grid">
                {['living-room', 'bedroom', 'office', 'dining-room'].map((preset) => (
                  <button 
                    key={preset} 
                    className="preset-button"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="preset-thumbnail">
                      <div className="preset-icon"></div>
                    </div>
                    <span>{preset.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color schemes */}
            <div className="tab-section">
              <h3>Color Schemes</h3>
              <div className="color-scheme-grid">
                {[
                  {name: 'neutral', colors: ['#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E']},
                  {name: 'warm', colors: ['#FFF8E1', '#FFE0B2', '#FFCC80', '#FFB74D']},
                  {name: 'cool', colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7']},
                  {name: 'elegant', colors: ['#FAFAFA', '#212121', '#616161', '#757575']},
                  {name: 'natural', colors: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F']},
                ].map((scheme) => (
                  <button 
                    key={scheme.name} 
                    className="color-scheme-button"
                    onClick={() => handleApplyColorScheme(scheme.name)}
                  >
                    <div className="color-samples">
                      {scheme.colors.map((color, i) => (
                        <div key={i} className="color-sample" style={{backgroundColor: color}}></div>
                      ))}
                    </div>
                    <span>{scheme.name.charAt(0).toUpperCase() + scheme.name.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
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

            {/* Lighting settings */}
            <div className="tab-section">
              <h3>Lighting</h3>
              <div className="control-group">
                <label>Time of Day</label>
                <select 
                  className="select-input"
                  value={room.timeOfDay}
                  onChange={(e) => handleLightingChange('timeOfDay', e.target.value)}
                >
                  <option value="morning">Morning</option>
                  <option value="day">Day</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Ambient Light: {room.ambientLightIntensity.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={room.ambientLightIntensity}
                  onChange={(e) => handleLightingChange('ambientLightIntensity', parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
              
              <div className="control-group">
                <label>Main Light Color</label>
                <input
                  type="color"
                  value={room.mainLightColor}
                  onChange={(e) => handleLightingChange('mainLightColor', e.target.value)}
                  className="color-picker"
                />
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

      case "custom":
        return (
          <>
            <div className="tab-section">
              <h3>Import Custom 3D Model</h3>
              <p>Upload 3D models in GLB or GLTF format from Blender or other 3D software.</p>
              
              <div className="control-group">
                <label>Model File (GLB/GLTF)</label>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleModelUpload}
                  className="file-input"
                />
              </div>
              
              {customModelPreview && (
                <div className="model-preview">
                  <div className="preview-placeholder">
                    <div className="preview-icon">📦</div>
                    <p>Model ready to import</p>
                  </div>
                </div>
              )}
              
              <div className="control-group">
                <label>Model Name</label>
                <input
                  type="text"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  placeholder="Enter model name"
                  className="text-input"
                />
              </div>
              
              <div className="control-group">
                <label>Model Dimensions (in meters)</label>
                <div className="dimensions-grid">
                  <div className="dimension-control">
                    <label>Width</label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={customModelDimensions.width}
                      onChange={(e) => setCustomModelDimensions({
                        ...customModelDimensions,
                        width: Number(e.target.value)
                      })}
                      className="text-input"
                    />
                  </div>
                  <div className="dimension-control">
                    <label>Depth</label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={customModelDimensions.depth}
                      onChange={(e) => setCustomModelDimensions({
                        ...customModelDimensions,
                        depth: Number(e.target.value)
                      })}
                      className="text-input"
                    />
                  </div>
                  <div className="dimension-control">
                    <label>Height</label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={customModelDimensions.height}
                      onChange={(e) => setCustomModelDimensions({
                        ...customModelDimensions,
                        height: Number(e.target.value)
                      })}
                      className="text-input"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAddCustomModel}
                className="primary-button full-width"
                disabled={!customModelUrl || !customModelName}
              >
                Add Custom Model
              </button>
              
              <div className="tab-section">
                <h3>Your Custom Models</h3>
                {customModels.length > 0 ? (
                  <div className="saved-designs-list">
                    {customModels.map((model) => (
                      <div key={model.id} className="saved-design-item">
                        <div className="saved-design-name">{model.name}</div>
                        <button
                          onClick={() => handleSelectCustomModel(model.id)}
                          className="secondary-button"
                        >
                          Use Model
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No custom models imported yet</div>
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
          className={`tab ${activeTab === "custom" ? "active" : ""}`}
          onClick={() => setActiveTab("custom")}
        >
          Custom
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
    </div>
  )
}