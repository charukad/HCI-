"use client"

import { useState } from "react"
import VisualizerScene from "./components/VisualizerScene"
import ControlPanel from "./components/ControlPanel"
import RoomDesigner2D from "./components/RoomDesigner2D"
import { FurnitureProvider } from "./context/FurnitureContext"
import { ViewMode, WorkflowStep } from "./types"
import { useFurniture } from "./context/FurnitureContext"
import "./App.css"

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
                className="panel-toggle"
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
      <div className="workflow-nav">
        {Object.values(WorkflowStep).map((step, index) => (
          <div key={step} className="workflow-step">
            <button
              onClick={() => setWorkflowStep(step)}
              className={`step-button ${workflowStep === step ? "active" : ""}`}
            >
              <div className="step-indicator">
                {index + 1}
              </div>
              {step}
            </button>

            {index < Object.values(WorkflowStep).length - 1 && (
              <div className="step-connector">
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
