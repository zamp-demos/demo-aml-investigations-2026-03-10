const fs = require('fs');
const path = require('path');

const PROCESS_ID = 'AML_003';
const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public/data');
// Log path now uses process_{id}.json pattern
// Status updates via API
const EMAIL_STATUS_PATH = path.join(PUBLIC_DATA_DIR, 'email-status.json');
const SIGNAL_FILE_PATH = path.join(PROJECT_ROOT, 'interaction-signals.json');

// === HELPERS ===
function readJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateProcessLog(newLog) {
  const detailPath = path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`);
  let detail = readJson(detailPath) || { logs: [], keyDetails: {}, sidebarArtifacts: [] };
  
  const existingIdx = detail.logs.findIndex(l => l.id === newLog.id && l.status === 'processing');
  if (newLog.status !== 'processing' && existingIdx !== -1) {
    detail.logs[existingIdx] = newLog;
  } else if (newLog.status === 'processing') {
    detail.logs = detail.logs.filter(l => !(l.id === newLog.id && l.status === 'processing'));
    detail.logs.push(newLog);
  } else {
    detail.logs.push(newLog);
  }
  
  if (newLog.keyDetailsUpdate) {
    detail.keyDetails = { ...detail.keyDetails, ...newLog.keyDetailsUpdate };
  }
  
  writeJson(detailPath, detail);
}

async function updateProcessListStatus(processId, status) {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  try {
    const response = await fetch(`${API_URL}/api/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processId, status })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.log(`API call failed, falling back to file write: ${error.message}`);
    const casesFilePath = path.join(PUBLIC_DATA_DIR, 'processes.json');
    let cases = readJson(casesFilePath) || [];
    const caseIndex = cases.findIndex(c => c.id === processId);
    if (caseIndex !== -1) {
      cases[caseIndex].status = status;
      writeJson(casesFilePath, cases);
    }
  }
}

async function waitForEmail() {
  console.log('[HITL] Waiting for email to be sent...');
  while (true) {
    await delay(500);
    const status = readJson(EMAIL_STATUS_PATH);
    if (status && status.sent === true) {
      console.log('[HITL] Email sent, continuing...');
      // Reset for next time
      writeJson(EMAIL_STATUS_PATH, { sent: false });
      return;
    }
  }
}

async function waitForSignal(signalName) {
  console.log(`[HITL] Waiting for signal: ${signalName}...`);
  while (true) {
    await delay(500);
    const signals = readJson(SIGNAL_FILE_PATH) || {};
    if (signals[signalName] === true) {
      console.log(`[HITL] Signal ${signalName} received, continuing...`);
      // Clear the signal
      delete signals[signalName];
      writeJson(SIGNAL_FILE_PATH, signals);
      return;
    }
  }
}

// === STEP DEFINITIONS ===
const steps = [
  {
    id: 'step_1',
    title_p: 'Receiving investigation case from Pega AIM...',
    title_s: 'Investigation case INV-2025-05-1204 received from Pega AIM: $74,500 in rapid P2P transfers between 4 personal accounts over 72 hours, terminating in wire to crypto exchange',
    timestamp: 'May 19, 11:07 AM',
    reasoning: [
      'Pega Alert Intake case ALT-2025-05-2087 created and processed',
      'Alert source: Transaction Monitoring',
      'Triggered rule 15: Circular fund flow detected across linked accounts within 72-hour window',
      'Triggered rule 21: Terminal transfer to registered cryptocurrency exchange',
      'Pega enrichment completed: profiles for all 4 linked accounts, transaction data, network mapping assembled',
      'DLA network indexed: 4 subjects, 4 accounts, all inter-account transfers, external wire vertices created',
      'Risk score assigned: 71/100',
      'Priority: High — routed to L2 investigation queue',
      'Primary account holder: Kevin Dao, 24, freelance graphic designer, Oakland CA'
    ],
    artifacts: [
      { id: 'txn_details_3', type: 'file', label: 'Transaction Details', pdfPath: '/data/aml_003_transaction_details.pdf' },
      { id: 'rules_applied_3', type: 'json', label: 'View Rules Applied', data: { rule15: 'Circular fund flow detected', rule21: 'Terminal transfer to crypto exchange' } },
      { id: 'customer_profiles_3', type: 'file', label: 'Customer Profiles (4)', pdfPath: '/data/aml_003_customer_profiles.pdf' },
      { id: 'kyc_files_3', type: 'file', label: 'KYC Files (4)', pdfPath: '/data/aml_003_kyc_files.pdf' },
      { id: 'txn_history_3', type: 'file', label: 'Transaction History', pdfPath: '/data/aml_003_transaction_history.pdf' },
      { id: 'dla_network_3', type: 'json', label: 'DLA Network Graph', data: { nodes: 4, edges: 11, type: 'circular_flow' } }
    ]
  },
  {
    id: 'step_2',
    title_p: 'Mapping account holder network...',
    title_s: 'Network mapped: 4 account holders share recent account opening dates and low income profiles',
    timestamp: 'May 19, 11:10 AM',
    reasoning: [
      'Kevin Dao, 24, Oakland — freelance graphic designer, account opened March 2024',
      'Michelle Tran, 23, Oakland — barista, account opened April 2024',
      'Derek Huang, 25, San Francisco — rideshare driver, account opened February 2024',
      'Priya Mehta, 22, Berkeley — graduate student, account opened May 2024',
      'All four opened accounts within a 3-month window at different branches',
      'All list annual income under $35,000',
      'Dao and Tran share a residential address'
    ],
    artifacts: [
      { id: 'account_holders_3', type: 'json', label: 'Account Holder Profiles (4)', data: { kevin_dao: { age: 24, location: 'Oakland', income: '<$35k' }, michelle_tran: { age: 23, location: 'Oakland', income: '<$35k' }, derek_huang: { age: 25, location: 'San Francisco', income: '<$35k' }, priya_mehta: { age: 22, location: 'Berkeley', income: '<$35k' } } }
    ]
  },
  {
    id: 'step_3',
    title_p: 'Screening all four individuals against sanctions and adverse media databases...',
    title_s: 'Customer screening: No adverse findings on any of the four individuals',
    timestamp: 'May 19, 11:14 AM',
    reasoning: [
      'All four cleared on OFAC and sanctions screening',
      'No PEP matches on WorldCheck or LexisNexis',
      'No adverse media found on any individual',
      'No prior SARs or alerts on any of the four accounts',
      'Individual profiles are not concerning — the pattern across accounts is the issue'
    ],
    artifacts: [
      { id: 'worldcheck_3', type: 'video', label: 'WorldCheck', videoPath: '/data/aml_003_worldcheck_recording.webm' },
      { id: 'lexisnexis_3', type: 'video', label: 'LexisNexis', videoPath: '/data/aml_003_lexisnexis_recording.webm' }
    ]
  },
  {
    id: 'step_4',
    title_p: 'Analyzing fund flow across linked accounts...',
    title_s: 'Fund flow analysis: Funds aggregate through layered P2P transfers before converting to crypto',
    timestamp: 'May 19, 11:18 AM',
    reasoning: [
      '11 Zelle transfers between four accounts over 72 hours, amounts between $3,000 and $9,500',
      'Funds originate from external inbound wires into Huang and Mehta\'s accounts',
      'Transfers pass through Dao and Tran before consolidating in Dao\'s account',
      'Dao wires $74,500 to a Coinbase institutional account',
      'Amounts like $7,340, $4,815, $6,290 suggest deliberate randomization to avoid detection',
      'Net flow is strictly unidirectional: external sources → Huang/Mehta → Dao/Tran → Dao → crypto'
    ],
    artifacts: [
      { id: 'fund_flow_3', type: 'json', label: 'Fund Flow Diagram', data: { total_transfers: 11, flow_pattern: 'layered_aggregation', terminal_destination: 'Coinbase' } },
      { id: 'transfer_sequence_3', type: 'json', label: 'Transfer Sequence Timeline', data: { duration_hours: 72, transfers: 11, randomization: true } }
    ]
  },
  {
    id: 'step_5',
    title_p: 'Tracing external inbound wire sources...',
    title_s: 'External inbound wires traced to two opaque LLCs with no connection to any account holder',
    timestamp: 'May 19, 11:22 AM',
    reasoning: [
      '$38,000 from Greenfield Consulting Group LLC (Delaware) into Huang\'s account',
      '$41,000 from Pacific Ridge Ventures LLC (Wyoming) into Mehta\'s account',
      'Delaware Division of Corporations: Greenfield incorporated 2024, registered agent address only, no website or LinkedIn',
      'Wyoming Secretary of State: Pacific Ridge filed 2024, Wyoming does not require member disclosure',
      'Neither entity has any discoverable connection to Huang or Mehta',
      'Both states are commonly used for opaque LLC formation due to minimal disclosure requirements'
    ],
    artifacts: [
      { id: 'delaware_corp_3', type: 'video', label: 'Delaware Division of Corporations', videoPath: '/data/aml_003_delaware_corp_recording.webm' },
      { id: 'wyoming_sos_3', type: 'video', label: 'Wyoming Secretary of State', videoPath: '/data/aml_003_wyoming_sos_recording.webm' }
    ]
  },
  {
    id: 'step_6',
    title_p: 'Analyzing social media connections between account holders...',
    title_s: 'Social media analysis: All four individuals are connected through UC Berkeley network',
    timestamp: 'May 19, 11:26 AM',
    reasoning: [
      'Instagram shows Dao, Tran, and Huang follow each other and appear in shared campus event photos (2021-2023)',
      'Mehta\'s LinkedIn shows UC Berkeley graduate program, class of 2025',
      'All four are part of the same university social circle',
      'Dao\'s Twitter/X contains posts about crypto trading and "passive income" from November 2024',
      'One post references "helping friends get started" with a crypto opportunity',
      'Social connection confirms coordinated activity rather than coincidental overlap'
    ],
    artifacts: [
      { id: 'instagram_3', type: 'video', label: 'Instagram', videoPath: '/data/aml_003_instagram_recording.webm' },
      { id: 'linkedin_3', type: 'video', label: 'LinkedIn', videoPath: '/data/aml_003_linkedin_recording.webm' },
      { id: 'twitter_3', type: 'video', label: 'Twitter/X', videoPath: '/data/aml_003_twitter_recording.webm' }
    ]
  },
  {
    id: 'step_7',
    title_p: 'Updating risk assessment...',
    title_s: 'Risk score updated to 88/100',
    timestamp: 'May 19, 11:29 AM',
    reasoning: [
      'Four low-income individuals receiving large wires from opaque LLCs with no connection to their backgrounds',
      'Funds layered through P2P transfers with randomized amounts before crypto conversion',
      'Unidirectional flow: external sources → distribution accounts → aggregation → crypto exchange',
      'Social connection confirms coordination',
      'Opaque source entities provide no visibility into true fund origin',
      'Pattern consistent with layering network using personal accounts as pass-throughs'
    ],
    artifacts: [
      { id: 'risk_assessment_3', type: 'json', label: 'Risk Assessment', data: { previous_score: 71, updated_score: 88, risk_level: 'High' } }
    ]
  },
  {
    id: 'step_8',
    title_p: 'Generating targeted RFI for primary account holder...',
    title_s: 'RFI sent to Kevin Dao only — framed as routine inquiry on large crypto purchase',
    timestamp: 'May 19, 11:32 AM',
    reasoning: [
      'Dao selected as sole RFI recipient — he is the terminal account holder who executed the crypto wire',
      'Contacting all four would reveal investigation scope',
      'RFI framed around the single $74,500 Coinbase wire',
      'RFI Reference: RFI-2025-05-0587',
      'Due date: 06/02/2025 (10 business days)',
      'SLA tracking: Active',
      'Requested: source and purpose of funds for Coinbase wire, relationship with Greenfield Consulting and Pacific Ridge Ventures, documentation for any investment arrangement'
    ],
    artifacts: [
      {
        id: 'rfi_email_3',
        type: 'email_draft',
        label: 'Account Activity Inquiry — Kevin Dao',
        data: {
          isIncoming: false,
          from: 'compliance@meridianbank.com',
          to: 'kevin.dao@email.com',
          cc: '',
          subject: 'Account Activity Inquiry — Kevin Dao',
          body: `Dear Mr. Dao,\n\nAs part of our routine account monitoring, we are reviewing the wire transfer of $74,500 to Coinbase on May 16, 2025.\n\nPlease provide:\n1. Source and purpose of these funds\n2. Your relationship with Greenfield Consulting Group LLC and Pacific Ridge Ventures LLC\n3. Documentation for any investment arrangement\n\nPlease respond by June 2, 2025 (RFI-2025-05-0587).\n\nSincerely,\nCompliance Department\nMeridian Bank`
        }
      }
    ]
  },
  {
    id: 'step_9',
    title_p: 'Processing RFI response...',
    title_s: 'RFI response received: Vague explanation, no documentation provided',
    timestamp: 'May 28, 04:12 PM',
    reasoning: [
      'Dao states funds are from a "group crypto investment pool" he manages for friends',
      'Claims Greenfield and Pacific Ridge are "investors" but cannot name individuals behind them',
      'Says arrangement is informal with no written agreement',
      'Does not explain why funds were routed through Huang and Mehta rather than sent directly to Coinbase',
      'No documentation provided — states "it\'s all informal, we trust each other"',
      'Informal pool of $79,000 from anonymous LLCs through 4 personal accounts with no documentation is not a credible explanation'
    ],
    artifacts: [
      {
        id: 'rfi_response_3',
        type: 'email_draft',
        label: 'RE: Account Activity Inquiry...',
        data: {
          isIncoming: true,
          from: 'kevin.dao@email.com',
          to: 'compliance@meridianbank.com',
          cc: '',
          subject: 'RE: Account Activity Inquiry — Kevin Dao',
          body: `Hi,\n\nThe funds are from a group crypto investment pool I manage for friends. Greenfield and Pacific Ridge are investors but it's all informal - we trust each other so there's no written agreement.\n\nThe Coinbase transfer was for our group investment.\n\nThanks,\nKevin`
        }
      }
    ]
  },
  {
    id: 'step_10',
    title_p: 'Compiling investigation conclusions...',
    title_s: 'Investigation concluded: Activity consistent with layering network using personal accounts to obscure fund origin before crypto conversion',
    timestamp: 'May 28, 04:18 PM',
    reasoning: [
      'Opaque source LLCs provide no visibility into true fund origin',
      'Funds deliberately routed through personal accounts rather than sent directly to exchange',
      'Transfer amounts randomized to avoid pattern detection',
      'Network members socially connected confirming coordinated participation',
      'Customer response provides no credible explanation or documentation',
      'Inability to identify true source of $79,000 is itself a reportable concern'
    ],
    artifacts: [
      { id: 'case_summary_3', type: 'file', label: 'Case Summary', pdfPath: '/data/aml_003_case_summary.pdf' }
    ]
  },
  {
    id: 'step_11',
    title_p: 'Drafting SAR narrative and FinCEN form...',
    title_s: 'SAR drafted: Pending analyst approval',
    timestamp: 'May 28, 04:24 PM',
    reasoning: [
      'SAR narrative covers: network structure, fund flow from opaque LLCs through P2P layering to crypto, social connection analysis, RFI response assessment',
      'FinCEN SAR form populated with all four account holders as subjects',
      'Recommended post-filing actions: enhanced monitoring on all four accounts, flag Greenfield Consulting and Pacific Ridge Ventures for watchlist screening across the bank, preserve records for potential law enforcement request'
    ],
    artifacts: [
      { id: 'sar_draft_3', type: 'file', label: 'SAR Draft', pdfPath: '/data/aml_003_sar_draft.pdf' },
      { id: 'fincen_form_3', type: 'file', label: 'FinCEN SAR Form', pdfPath: '/data/aml_003_fincen_sar_form.pdf' },
      { id: 'network_flow_3', type: 'json', label: 'Network Flow Diagram', data: { nodes: 6, edges: 13, flow_type: 'layered_aggregation' } }
    ]
  }
];

// === MAIN EXECUTION ===
(async () => {
  console.log(`[${PROCESS_ID}] Starting simulation...`);

  // Initialize process log
  const initialLog = {
    processId: PROCESS_ID,
    keyDetails: {
      subject: 'Kevin Dao + 3 linked accounts',
      alertId: 'ALT-2025-05-2087',
      amount: '$74,500',
      counterparty: 'Coinbase (crypto exchange)',
      riskScore: '71/100',
      priority: 'High — L2'
    },
    steps: steps.map(s => ({
      id: s.id,
      title_p: s.title_p,
      title_s: s.title_s,
      timestamp: s.timestamp,
      status: 'pending',
      reasoning: s.reasoning,
      artifacts: s.artifacts
    }))
  };
  // Initial log structure now handled by updateProcessLog writing to process_{id}.json
  await updateProcessListStatus(PROCESS_ID, 'In Progress');

  // Write initial keyDetails to process file
  const detailPath = path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`);
  const initDetail = readJson(detailPath) || { logs: [], keyDetails: {}, sidebarArtifacts: [] };
  initDetail.keyDetails = initialLog.keyDetails;
  writeJson(detailPath, initDetail);

  // Execute steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`[${PROCESS_ID}] Executing ${step.id}: ${step.title_p}`);

    // Processing state
    updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_p, reasoning: [], artifacts: [], status: 'processing' });
    await delay(2000);

    // Handle HITL at step 8 (email)
    if (step.id === 'step_8') {
      updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_s, reasoning: step.reasoning, artifacts: step.artifacts, status: 'warning' });
      await updateProcessListStatus(PROCESS_ID, 'Needs Attention');
      await waitForEmail();
    }

    // Handle HITL at step 11 (signal for SAR approval)
    if (step.id === 'step_11') {
      updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_s, reasoning: step.reasoning, artifacts: step.artifacts, status: 'warning' });
      await updateProcessListStatus(PROCESS_ID, 'Needs Attention');
      await waitForSignal('APPROVE_SAR_003');
    }

    // Update keyDetails at step 7
    if (step.id === 'step_7') {
      const log = readJson(path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`));
      log.keyDetails.riskScore = '88/100';
      writeJson(path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`), log);
    }

    // Success state
    const finalStatus = (i === steps.length - 1) ? 'completed' : 'success';
    updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_s, reasoning: step.reasoning, artifacts: step.artifacts, status: finalStatus });
    await delay(1500);
  }

  // Mark process as done
  await updateProcessListStatus(PROCESS_ID, 'Done');
  console.log(`[${PROCESS_ID}] Simulation complete.`);
})();
