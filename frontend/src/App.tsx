import { useState } from 'react'
import './App.css'
import { SimulationRequest, SimulationResponse, DEFAULT_REQUEST } from './types/simulation'
import { runSimulation } from './api/simulationApi'
import InputForm from './components/InputForm/InputForm'
import FanChart from './components/Results/FanChart'
import SummaryStats from './components/Results/SummaryStats'
import SequenceOfReturnsPanel from './components/Results/SequenceOfReturnsPanel'
import ScenarioComparison from './components/Results/ScenarioComparison'

interface SavedScenario {
  name: string;
  response: SimulationResponse;
}

function App() {
  const [response, setResponse] = useState<SimulationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [lastRequest, setLastRequest] = useState<SimulationRequest>(DEFAULT_REQUEST)

  const handleSubmit = async (request: SimulationRequest) => {
    setIsLoading(true)
    setError(null)
    setLastRequest(request)
    try {
      const result = await runSimulation(request)
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveScenario = () => {
    if (!response || savedScenarios.length >= 3) return
    const name = `Scenario ${savedScenarios.length + 1}`
    setSavedScenarios([...savedScenarios, { name, response }])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏦 Retirement Calculator</h1>
        <p className="subtitle">
          Monte Carlo simulation for US retirement planning
        </p>
      </header>

      <div className="app-layout">
        <aside className="input-panel">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </aside>

        <main className="results-panel">
          {error && (
            <div className="error-banner">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!response && !isLoading && !error && (
            <div className="placeholder">
              <h2>Configure your scenario</h2>
              <p>Fill in your details and click "Run Simulation" to see results.</p>
              <p className="disclaimer">
                ⚠️ Federal tax only — state taxes are not modeled. This tool is for
                educational purposes and does not constitute financial advice.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="placeholder">
              <h2>Running simulation...</h2>
              <p>Processing {lastRequest.simulationIterations.toLocaleString()} iterations</p>
              <div className="spinner" />
            </div>
          )}

          {response && !isLoading && (
            <div className="results-content">
              <SummaryStats response={response} />
              <FanChart response={response} />
              <SequenceOfReturnsPanel
                risk={response.sequenceOfReturnsRisk}
                retirementAge={lastRequest.retirementAge}
              />

              <div className="scenario-actions">
                <button
                  onClick={handleSaveScenario}
                  disabled={savedScenarios.length >= 3}
                  className="save-btn"
                >
                  💾 Save Scenario ({savedScenarios.length}/3)
                </button>
              </div>

              {savedScenarios.length > 0 && (
                <ScenarioComparison scenarios={savedScenarios} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
