const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public/data');
const PROCESS_ID = 'AML_002';

// ============================================================================
// HELPERS
// ============================================================================

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateProcessLog(processId, stepId, status, artifacts = null, keyDetailsUpdate = null) {
  const logPath = path.join(PUBLIC_DATA_DIR, 'process-logs.json');
  const data = readJson(logPath);
  
  if (!data[processId]) {
    data[processId] = { steps: [], keyDetails: {} };
  }
  
  const stepIndex = data[processId].steps.findIndex(s => s.id === stepId);
  if (stepIndex >= 0) {
    data[processId].steps[stepIndex].status = status;
    if (artifacts) {
      data[processId].steps[stepIndex].artifacts = artifacts;
    }
  }
  
  if (keyDetailsUpdate) {
    data[processId].keyDetails = { ...data[processId].keyDetails, ...keyDetailsUpdate };
  }
  
  writeJson(logPath, data);
}

async function updateProcessListStatus(processId, status) {
  const listPath = path.join(PUBLIC_DATA_DIR, 'process-list.json');
  const list = readJson(listPath);
  
  const processIndex = list.findIndex(p => p.id === processId);
  if (processIndex >= 0) {
    list[processIndex].status = status;
    writeJson(listPath, list);
  }
  
  // Try API call with fallback
  try {
    await fetch('http://localhost:3030/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processId, status })
    });
  } catch (e) {
    // Fallback already done with file write
  }
}

async function waitForSignal(signalId) {
  const signalPath = path.join(PUBLIC_DATA_DIR, 'interaction-signals.json');
  
  while (true) {
    await delay(500);
    
    try {
      const signals = readJson(signalPath);
      if (signals[signalId]) {
        // Clear the signal
        delete signals[signalId];
        writeJson(signalPath, signals);
        return signalId;
      }
    } catch (e) {
      // File might not exist yet
    }
  }
}

// ============================================================================
// STEPS DATA
// ============================================================================

const steps = [
  {
    id: 1,
    timestamp: 'Apr 14, 02:33 PM',
    title_p: 'Receiving investigation case from Pega AIM...',
    title_s: 'Investigation case INV-2025-04-0783 received from Pega AIM: 38 cash deposits totaling $347,000 over 45 days on account of Ray Muller, owner of Suncoast Auto Sales, Tampa FL',
    reasoning: [
      'Pega Alert Intake case ALT-2025-04-1142 created and processed',
      'Alert source: Transaction Monitoring',
      'Triggered rule 3: Cumulative cash deposits exceeding $100,000 in rolling 30-day window',
      'Triggered rule 9: Cash deposits at 6 different branch locations within reporting period',
      'Pega enrichment completed: customer profile, KYC file, deposit records, branch location data assembled',
      'DLA network indexed: subject, account, deposit transactions, branch vertices created',
      'Risk score assigned: 78/100',
      'Priority: High — routed to L2 investigation queue',
      'All 38 deposits fall between $8,200 and $9,800'
    ],
    artifacts: [
      { id: 'txn_details_002', type: 'file', label: 'Transaction Details', pdfPath: '/data/aml_002_transaction_details.pdf' },
      { id: 'rules_002', type: 'json', label: 'View Rules Applied', data: { rule3: 'Cumulative cash >$100k/30d', rule9: '6+ branch locations' } },
      { id: 'customer_prof_002', type: 'file', label: 'Customer Profile', pdfPath: '/data/aml_002_customer_profile.pdf' },
      { id: 'kyc_002', type: 'file', label: 'KYC File', pdfPath: '/data/aml_002_kyc_file.pdf' },
      { id: 'deposit_rec_002', type: 'file', label: 'Deposit Records 45 days', pdfPath: '/data/aml_002_deposit_records.pdf' },
      { id: 'loc_map_002', type: 'json', label: 'Deposit Location Map', data: { branches: 6, radius_miles: 30 } },
      { id: 'dla_graph_002', type: 'json', label: 'DLA Network Graph', data: { nodes: 41, edges: 77 } }
    ]
  },
  {
    id: 2,
    timestamp: 'Apr 14, 02:36 PM',
    title_p: 'Reviewing customer profile and screening databases...',
    title_s: 'Customer profile reviewed: Used car dealership owner, no prior alerts on account',
    reasoning: [
      'Ray Muller, 51, Tampa FL, account open since 2012',
      'Sole owner of Suncoast Auto Sales, W Hillsborough Ave, Tampa',
      'Declared annual income: $72,000',
      'No previous SARs filed on this account',
      'No OFAC or sanctions matches',
      'No PEP hits on WorldCheck or LexisNexis',
      'Customer has been low-risk profile for 13 years until this activity'
    ],
    artifacts: [
      { id: 'worldcheck_002', type: 'video', label: 'WorldCheck', videoPath: '/data/aml_002_worldcheck.webm' },
      { id: 'lexisnexis_002', type: 'video', label: 'LexisNexis', videoPath: '/data/aml_002_lexisnexis.webm' }
    ]
  },
  {
    id: 3,
    timestamp: 'Apr 14, 02:39 PM',
    title_p: 'Analyzing deposit pattern distribution...',
    title_s: 'Deposit pattern consistent with structuring — amounts calibrated below $10,000 CTR threshold',
    reasoning: [
      'Mean deposit: $9,131 with standard deviation of $487',
      'Tight clustering just below $10,000 is statistically inconsistent with organic cash receipts',
      'Used car sales generate varied amounts based on vehicle price — expect wide distribution not narrow band',
      'Deposits spread across 6 branches within 30-mile radius of Tampa',
      'No single branch received more than 7 deposits — appears designed to avoid teller familiarity',
      'Pattern matches FinCEN structuring typology'
    ],
    artifacts: [
      { id: 'deposit_dist_002', type: 'json', label: 'Deposit Distribution Analysis', data: { mean: 9131, stddev: 487, count: 38 } }
    ]
  },
  {
    id: 4,
    timestamp: 'Apr 14, 02:42 PM',
    title_p: 'Cross-referencing business filings against observed cash volume...',
    title_s: 'Business filings do not support observed cash volume',
    reasoning: [
      'Florida state filing shows Suncoast Auto Sales reported $410,000 annual revenue',
      '$347,000 in deposits in 45 days represents 85% of full year\'s reported revenue',
      'Industry benchmark: used car dealerships at this size typically receive 30-40% of revenue in cash',
      'Even at 100% cash, implied monthly run rate of $231,000 is 6x expected monthly revenue',
      'Customer\'s personal tax return shows $72,000 AGI — inconsistent with this cash volume'
    ],
    artifacts: [
      { id: 'fl_filing_002', type: 'video', label: 'Florida Business Filing', videoPath: '/data/aml_002_florida_filing.webm' },
      { id: 'financial_prof_002', type: 'json', label: 'Financial Profile', data: { annual_revenue: 410000, agi: 72000, deposits_45d: 347000 } }
    ]
  },
  {
    id: 5,
    timestamp: 'Apr 14, 02:45 PM',
    title_p: 'Screening for adverse media...',
    title_s: 'Adverse media found: Dealership address referenced in county investigation into salvage title fraud',
    reasoning: [
      'Google News search returned Tampa Bay Times article from February 2025',
      'Hillsborough County investigating title washing of salvage vehicles at multiple Tampa dealerships',
      'Suncoast Auto Sales address on W Hillsborough Ave mentioned as one of several locations under review',
      'Title washing: purchasing salvage vehicles cheaply, obtaining clean titles fraudulently, reselling at full market value',
      'Cash deposits could potentially represent proceeds from inflated vehicle sales',
      'No charges filed — investigation described as ongoing'
    ],
    artifacts: [
      { id: 'tbt_article_002', type: 'video', label: 'Tampa Bay Times Article', videoPath: '/data/aml_002_tbt_article.webm' },
      { id: 'google_news_002', type: 'video', label: 'Google News', videoPath: '/data/aml_002_google_news.webm' }
    ]
  },
  {
    id: 6,
    timestamp: 'Apr 14, 02:48 PM',
    title_p: 'Checking counterparty information...',
    title_s: 'Counterparty check: Not applicable — cash deposits have no identifiable counterparty',
    reasoning: [
      'Transaction type is over-the-counter cash deposits, not transfers',
      'No sender or originator to investigate',
      'Investigation focus remains on the deposit pattern and the depositor\'s profile'
    ],
    artifacts: []
  },
  {
    id: 7,
    timestamp: 'Apr 14, 02:50 PM',
    title_p: 'Updating risk assessment...',
    title_s: 'Risk score updated to 94/100',
    reasoning: [
      'Structuring pattern: 38 deposits tightly clustered below $10,000 across 6 branches',
      'Volume vs income: deposits represent 85% of annual revenue in 45 days',
      'Potential predicate offense: active county investigation into title fraud at the dealership',
      'Combined picture suggests structuring of potentially illicit proceeds'
    ],
    artifacts: [
      { id: 'risk_assess_002', type: 'json', label: 'Risk Assessment', data: { score: 94, factors: ['structuring', 'volume_mismatch', 'adverse_media'] } }
    ]
  },
  {
    id: 8,
    timestamp: 'Apr 14, 02:52 PM',
    title_p: 'Evaluating RFI appropriateness...',
    title_s: 'Decision: RFI not appropriate — tipping-off risk outweighs information value',
    reasoning: [
      'Active law enforcement investigation means customer contact could compromise external proceedings',
      'Structuring pattern is clear from internal data and does not require customer explanation',
      'Customer is unlikely to provide credible explanation for 38 sub-$10,000 deposits across 6 branches',
      'Proceeding directly to SAR'
    ],
    artifacts: [
      { id: 'decision_002', type: 'json', label: 'Decision Rationale', data: { rfi_recommended: false, reason: 'tipping_off_risk' } }
    ]
  },
  {
    id: 9,
    timestamp: 'Apr 14, 02:58 PM',
    title_p: 'Drafting SAR narrative and FinCEN form...',
    title_s: 'SAR drafted: Pending analyst approval',
    reasoning: [
      'SAR narrative covers: structuring pattern with deposit distribution, income inconsistency, adverse media linking dealership to title fraud investigation',
      'FinCEN SAR form populated: subject information, filing institution, suspicious activity characterization (structuring), date range, cumulative amount',
      'Recommended post-filing actions: restrict account to single-branch deposits, enhanced monitoring, preserve records for potential law enforcement request'
    ],
    artifacts: [
      { id: 'sar_draft_002', type: 'file', label: 'SAR Draft', pdfPath: '/data/aml_002_sar_draft.pdf' },
      { id: 'fincen_form_002', type: 'file', label: 'FinCEN SAR Form', pdfPath: '/data/aml_002_fincen_sar_form.pdf' },
      { id: 'deposit_evidence_002', type: 'json', label: 'Deposit Pattern Evidence', data: { deposits: 38, mean: 9131, branches: 6 } }
    ]
  }
];

// ============================================================================
// MAIN SIMULATION
// ============================================================================

async function runSimulation() {
  console.log(`[${PROCESS_ID}] Starting AML investigation simulation...`);
  
  // Initialize keyDetails
  const initialKeyDetails = {
    subject: 'Ray Muller / Suncoast Auto Sales',
    alertId: 'ALT-2025-04-1142',
    amount: '$347,000 (38 deposits)',
    counterparty: 'N/A (cash deposits)',
    riskScore: '78/100',
    priority: 'High — L2'
  };
  
  await updateProcessLog(PROCESS_ID, 1, 'processing', null, initialKeyDetails);
  await updateProcessListStatus(PROCESS_ID, 'In Progress');
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`[${PROCESS_ID}] Step ${step.id}: ${step.title_p}`);
    
    // Processing state
    await updateProcessLog(PROCESS_ID, step.id, 'processing');
    await delay(2000);
    
    // Handle step 7 keyDetails update
    if (step.id === 7) {
      await updateProcessLog(PROCESS_ID, step.id, 'success', step.artifacts, { riskScore: '94/100' });
    } else {
      await updateProcessLog(PROCESS_ID, step.id, 'success', step.artifacts);
    }
    
    await delay(1500);
    
    // HITL at step 9
    if (step.id === 9) {
      console.log(`[${PROCESS_ID}] Step 9: Waiting for SAR approval signal...`);
      await updateProcessLog(PROCESS_ID, step.id, 'warning', step.artifacts);
      await updateProcessListStatus(PROCESS_ID, 'Needs Attention');
      
      const signal = await waitForSignal('APPROVE_SAR_002');
      console.log(`[${PROCESS_ID}] Signal received: ${signal}`);
      
      // Set final status
      await updateProcessLog(PROCESS_ID, step.id, 'completed', step.artifacts);
      await updateProcessListStatus(PROCESS_ID, 'Done');
    }
  }
  
  console.log(`[${PROCESS_ID}] Simulation complete.`);
}

// ============================================================================
// EXECUTION
// ============================================================================

runSimulation().catch(err => {
  console.error(`[${PROCESS_ID}] Error:`, err);
  process.exit(1);
});
