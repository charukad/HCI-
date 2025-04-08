"use client"

import { useState } from "react"
import VisualizerScene from "./components/VisualizerScene"
import ControlPanel from "./components/ControlPanel"
import RoomDesigner2D from "./components/RoomDesigner2D"
import { FurnitureProvider } from "./context/FurnitureContext"
import { ViewMode, WorkflowStep } from "./types"
import { useFurniture } from "./context/FurnitureContext"

// Wrapper component to access context
function AppContent() {
  const { workflowStep, setWorkflowStep } = useFurniture()
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ThreeD)
  const [isPanelVisible, setIsPanelVisible] = useState(true)

  // Render different content based on workflow step
  const renderContent = () => {
    switch (workflowStep) {
      case WorkflowStep.RoomDesign2D:
        return <RoomDesigner2D />

      case WorkflowStep.RoomView3D:
      case WorkflowStep.FurnitureArrangement:
        return (
          <>
            {/* 3D visualization area - expands to fill available space */}
            <div
              style={{
                flex: 1,
                width: isPanelVisible ? "calc(100% - 300px)" : "100%",
                transition: "width 0.3s ease-in-out",
                position: "relative",
              }}
            >
              <VisualizerScene viewMode={viewMode} />

              {/* Toggle button for control panel */}
              <button
                onClick={() => setIsPanelVisible(!isPanelVisible)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 100,
                  padding: "8px 12px",
                  backgroundColor: "#4285F4",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                {isPanelVisible ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginRight: "8px" }}
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Hide Panel
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginRight: "8px" }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    Show Panel
                  </>
                )}
              </button>
            </div>

            {/* Control panel with animation */}
            <div
              style={{
                width: "300px",
                position: "absolute",
                right: isPanelVisible ? 0 : "-300px",
                top: 0,
                height: "100%",
                transition: "right 0.3s ease-in-out",
                zIndex: 10,
              }}
            >
              <ControlPanel viewMode={viewMode} onChangeViewMode={setViewMode} />
            </div>
          </>
        )
    }
  }

  // Workflow navigation
  const renderWorkflowNav = () => {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "15px",
          backgroundColor: "#f8f8f8",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
          zIndex: 1000,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        {Object.values(WorkflowStep).map((step, index) => (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setWorkflowStep(step)}
              style={{
                padding: "10px 20px",
                backgroundColor: workflowStep === step ? "#4285F4" : "#f0f0f0",
                color: workflowStep === step ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: workflowStep === step ? "bold" : "normal",
                display: "flex",
                alignItems: "center",
                boxShadow: workflowStep === step ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: workflowStep === step ? "white" : "#ddd",
                  color: workflowStep === step ? "#4285F4" : "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </div>
              {step}
            </button>

            {index < Object.values(WorkflowStep).length - 1 && (
              <div style={{ margin: "0 15px", color: "#999" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#999"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#333",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {renderWorkflowNav()}

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          marginTop: "50px",
          position: "relative",
        }}
      >
        {renderContent()}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <FurnitureProvider>
      <AppContent />
    </FurnitureProvider>
  )
}

