import type { SimulationRequest, SimulationResponse } from '../types/simulation';

const API_BASE = '/api';

export async function runSimulation(request: SimulationRequest): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Simulation failed: ${response.status} - ${error}`);
  }

  return response.json();
}
