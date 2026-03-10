// aml_story_4_hitl_decision.cjs
// AML_004 - Clean client, problematic counterparty (3-way HITL decision)

const fs = require('fs');
const path = require('path');

const PROCESS_ID = 'AML_004';
const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public/data');

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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

async function updateProcessListStatus(status) {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  try {
    const response = await fetch(`${API_URL}/api/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processId: PROCESS_ID, status })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(`✓ Status: ${status}`);
  } catch (error) {
    console.log(`API call failed, falling back to file write: ${error.message}`);
    const casesFilePath = path.join(PUBLIC_DATA_DIR, 'processes.json');
    let cases = readJson(casesFilePath) || [];
    const caseIndex = cases.findIndex(c => c.id === PROCESS_ID);
    if (caseIndex !== -1) {
      cases[caseIndex].status = status;
      writeJson(casesFilePath, cases);
    }
  }
}

async function waitForAnySignal(signalNames) {
  const POLL_INTERVAL = 1000;
  const MAX_WAIT = 3600000; // 1 hour
  const startTime = Date.now();
  const signalPath = path.join(PUBLIC_DATA_DIR, 'interaction-signals.json');

  console.log(`⏳ Waiting for one of: ${signalNames.join(', ')}`);

  while (Date.now() - startTime < MAX_WAIT) {
    if (fs.existsSync(signalPath)) {
      const signals = readJson(signalPath);
      
      for (const signalName of signalNames) {
        if (signals && signals[signalName]) {
          console.log(`✓ Signal received: ${signalName}`);
          return signalName;
        }
      }
    }
    
    await delay(POLL_INTERVAL);
  }

  throw new Error(`Timeout waiting for any of: ${signalNames.join(', ')}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEPS DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

const steps = [
  {
    id: 'step1',
    timestamp: 'Jun 9, 09:41 AM',
    title_p: 'Receiving investigation case from Pega AIM...',
    title_s: 'Investigation case INV-2025-06-0298 received from Pega AIM: $840,000 wire from Hartwell Manufacturing Inc to Zhengda Industrial Supply Co Ltd, Hong Kong',
    reasoning: [
      'Pega Alert Intake case ALT-2025-06-0514 created and processed',
      'Alert source: Transaction Monitoring',
      'Triggered rule 6: Transfer amount exceeding $500,000 to new beneficiary',
      'Triggered rule 14: First transaction to Hong Kong-based entity on this account',
      'Pega enrichment completed: customer profile, KYC file, 36-month transaction history, beneficial ownership records assembled',
      'DLA network indexed: subject, account, transaction, beneficiary vertices created',
      'Risk score assigned: 65/100',
      'Priority: High — routed to L2 investigation queue',
      'Customer profile: Hartwell Manufacturing Inc, Cleveland OH, industrial valve and pump manufacturer, account open since 2009'
    ],
    artifacts: [
      { id: 'tx_details', type: 'file', label: 'Transaction Details', pdfPath: '/data/aml_004_transaction_details.pdf' },
      { id: 'rules_applied', type: 'json', label: 'View Rules Applied', data: { rules: ['Rule 6: Transfer amount exceeding $500,000 to new beneficiary', 'Rule 14: First transaction to Hong Kong-based entity'] } },
      { id: 'customer_profile', type: 'file', label: 'Customer Profile', pdfPath: '/data/aml_004_customer_profile.pdf' },
      { id: 'kyc_file', type: 'file', label: 'KYC File', pdfPath: '/data/aml_004_kyc_file.pdf' },
      { id: 'tx_history', type: 'file', label: 'Transaction History 36mo', pdfPath: '/data/aml_004_transaction_history.pdf' },
      { id: 'beneficial_ownership', type: 'file', label: 'Beneficial Ownership Records', pdfPath: '/data/aml_004_beneficial_ownership.pdf' },
      { id: 'dla_graph', type: 'json', label: 'DLA Network Graph', data: { vertices: ['Hartwell Manufacturing Inc', 'Account #782-4401', 'Transaction #06-0514', 'Zhengda Industrial Supply Co Ltd'] } }
    ]
  },
  {
    id: 'step2',
    timestamp: 'Jun 9, 09:44 AM',
    title_p: 'Reviewing customer profile and compliance history...',
    title_s: 'Customer profile reviewed: Established US manufacturer with clean compliance history',
    reasoning: [
      'Hartwell Manufacturing Inc, incorporated Ohio 1987, 145 employees per LinkedIn',
      'Manufactures industrial valves and pumps for oil and gas sector',
      'Annual revenue $38M per most recent SEC filing',
      'UBO: David Hartwell, 63, US citizen, no PEP matches, no adverse media',
      'No prior SARs, no previous alerts, no sanctions hits',
      'Account history shows regular international wires to suppliers in Germany, Japan, and South Korea',
      'Hong Kong is a new corridor for this customer but international procurement is core to their business',
      '$840,000 is within range of their typical supplier payments ($200K–$1.2M)'
    ],
    artifacts: [
      { id: 'sec_filing', type: 'video', label: 'SEC Filing', videoPath: '/data/aml_004_sec_filing.webm' },
      { id: 'linkedin', type: 'video', label: 'LinkedIn', videoPath: '/data/aml_004_linkedin.webm' },
      { id: 'worldcheck', type: 'video', label: 'WorldCheck', videoPath: '/data/aml_004_worldcheck.webm' },
      { id: 'lexisnexis', type: 'video', label: 'LexisNexis', videoPath: '/data/aml_004_lexisnexis.webm' }
    ]
  },
  {
    id: 'step3',
    timestamp: 'Jun 9, 09:48 AM',
    title_p: 'Analyzing transaction patterns...',
    title_s: 'Transaction pattern analysis: Wire is consistent with customer\'s procurement behavior',
    reasoning: [
      'Customer averages 4-6 international supplier payments per quarter',
      'Amounts range from $200K to $1.2M — $840K falls within this band',
      'Timing aligns with Q2 procurement cycle visible in prior years',
      'No velocity anomaly, no structuring indicators, no round-amount concerns',
      'Only deviation from historical pattern is the new geography (Hong Kong)'
    ],
    artifacts: [
      { id: 'pattern_analysis', type: 'json', label: 'Pattern Analysis', data: { avgQuarterlyPayments: '4-6', amountRange: '$200K-$1.2M', currentAmount: '$840K', anomaly: 'New geography (Hong Kong)' } }
    ]
  },
  {
    id: 'step4',
    timestamp: 'Jun 9, 09:52 AM',
    title_p: 'Investigating counterparty Zhengda Industrial Supply Co Ltd...',
    title_s: 'Counterparty "Zhengda Industrial Supply Co Ltd" — company exists but beneficial ownership raises concerns',
    reasoning: [
      'Hong Kong Companies Registry confirms Zhengda Industrial Supply registered in 2019',
      'Listed activity: wholesale industrial machinery and components',
      'Company has a basic website listing valve and pump parts — products are relevant to Hartwell\'s business',
      'However, browser search on directors returned a match on one director: Chen Weiming',
      'Chen Weiming appears on a 2023 BIS Entity List addition for involvement in unauthorized re-export of controlled industrial components to sanctioned jurisdictions',
      'BIS listing references re-export of dual-use pump components to Iran through intermediary companies in Hong Kong and Malaysia',
      'Chen Weiming is listed as director of Zhengda and two other Hong Kong entities named in the BIS action'
    ],
    artifacts: [
      { id: 'hk_registry', type: 'video', label: 'HK Companies Registry', videoPath: '/data/aml_004_hk_registry.webm' },
      { id: 'zhengda_website', type: 'video', label: 'Zhengda Website', videoPath: '/data/aml_004_zhengda_website.webm' },
      { id: 'bis_entity_list', type: 'video', label: 'BIS Entity List', videoPath: '/data/aml_004_bis_entity_list.webm' }
    ]
  },
  {
    id: 'step5',
    timestamp: 'Jun 9, 09:57 AM',
    title_p: 'Cross-referencing Zhengda with other BIS-listed entities...',
    title_s: 'Additional research: Zhengda shares registered address with another BIS-listed entity',
    reasoning: [
      'Zhengda\'s registered address in Kwun Tong, Kowloon is shared with Apex Precision Parts Ltd',
      'Apex Precision Parts appears on the same 2023 BIS Entity List action as Chen Weiming',
      'BIS filing describes a network of Hong Kong companies used to procure US-origin industrial components and re-export to Iran',
      'Zhengda itself is not named on the BIS Entity List — only its director and its co-located entity are listed',
      'This creates ambiguity: Zhengda could be a separate legitimate business that happens to share a director and address, or it could be part of the same procurement network'
    ],
    artifacts: [
      { id: 'bis_filing', type: 'video', label: 'BIS Entity List Filing', videoPath: '/data/aml_004_bis_filing.webm' },
      { id: 'hk_registry_apex', type: 'video', label: 'HK Companies Registry Apex', videoPath: '/data/aml_004_hk_registry_apex.webm' }
    ]
  },
  {
    id: 'step6',
    timestamp: 'Jun 9, 10:01 AM',
    title_p: 'Running OFAC and export control cross-checks...',
    title_s: 'OFAC and export control cross-check on Zhengda Industrial Supply',
    reasoning: [
      'Zhengda is not on the OFAC SDN list',
      'Zhengda is not on the BIS Entity List directly',
      'However, transacting with an entity whose director is BIS-listed creates potential export control liability for Hartwell',
      'Hartwell manufactures industrial valves and pumps — these are potentially EAR-controlled items depending on specifications',
      'If Hartwell\'s products are dual-use and Zhengda\'s director is involved in re-exporting controlled items to Iran, this wire could facilitate sanctions evasion even though neither the customer nor the entity itself is sanctioned',
      'The risk is not AML in the traditional sense — it is proliferation financing and export control violation risk'
    ],
    artifacts: [
      { id: 'ofac_check', type: 'json', label: 'OFAC SDN Check', data: { entity: 'Zhengda Industrial Supply Co Ltd', status: 'Not found on SDN list' } },
      { id: 'ear_control', type: 'json', label: 'EAR Control Classification Reference', data: { products: 'Industrial valves and pumps', classification: 'Potentially dual-use (EAR-controlled)' } }
    ]
  },
  {
    id: 'step7',
    timestamp: 'Jun 9, 10:05 AM',
    title_p: 'Updating risk assessment...',
    title_s: 'Risk score updated to 82/100',
    reasoning: [
      'Customer is clean with a legitimate business need for industrial component procurement',
      'Transaction amount and pattern are consistent with normal purchasing behavior',
      'However, counterparty\'s director is BIS-listed for re-export violations to Iran',
      'Counterparty shares address with another BIS-listed entity',
      'Potential for Hartwell\'s products to be re-exported to sanctioned jurisdiction through Zhengda',
      'Customer may be entirely unaware of counterparty\'s director and associated entities'
    ],
    artifacts: [
      { id: 'risk_assessment', type: 'json', label: 'Risk Assessment', data: { previousScore: '65/100', updatedScore: '82/100', reason: 'BIS-listed director and co-located entity' } }
    ]
  },
  {
    id: 'step8',
    timestamp: 'Jun 9, 10:09 AM',
    title_p: 'Compiling decision options for analyst review...',
    title_s: 'Decision required: Customer is clean but counterparty presents export control and proliferation concerns',
    reasoning: [
      'Agent has concluded investigation — customer is legitimate, counterparty is problematic',
      'Three recommended actions presented for analyst decision:',
      'Option A — Block transaction, notify customer, file SAR: Most conservative. Transaction rejected, customer informed, SAR filed citing BIS-linked director',
      'Option B — Hold transaction, request more information before deciding: Transaction on hold, RFI sent to Hartwell asking how they sourced Zhengda and what products being purchased',
      'Option C — File SAR, release transaction with conditions: SAR filed, transaction released because customer clean and Zhengda not sanctioned, enhanced monitoring placed'
    ],
    artifacts: [
      { id: 'decision_options', type: 'json', label: 'Decision Options Brief', data: { 
        customerStatus: 'Clean - legitimate business',
        counterpartyStatus: 'Problematic - BIS-linked director',
        riskLevel: '82/100'
      }},
      { id: 'case_summary', type: 'file', label: 'Case Summary', pdfPath: '/data/aml_004_case_summary.pdf' },
      { 
        id: 'decision', 
        type: 'decision', 
        label: 'Select Action',
        data: {
          question: 'Select recommended action for Hartwell Manufacturing case',
          options: [
            {
              id: 'option_a',
              label: 'Option A — Block transaction, notify customer, file SAR',
              signal: 'OPTION_A_004',
              description: 'Most conservative. Transaction rejected, SAR filed citing BIS-linked director.'
            },
            {
              id: 'option_b',
              label: 'Option B — Hold transaction, request more information',
              signal: 'OPTION_B_004',
              description: 'Transaction on hold. RFI sent to Hartwell about Zhengda sourcing and products.'
            },
            {
              id: 'option_c',
              label: 'Option C — File SAR, release transaction with conditions',
              signal: 'OPTION_C_004',
              description: 'SAR filed, transaction released. Enhanced monitoring placed on account.'
            }
          ]
        }
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

function initializeProcess() {
  const logPath = path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`);
  
  const initialData = {
    processId: PROCESS_ID,
    stockId: 'INV-2025-06-0298',
    name: 'Hartwell Manufacturing Inc — $840K Wire to Hong Kong',
    timestamp: 'Jun 9, 09:41 AM',
    category: 'aml-investigations',
    keyDetails: {
      subject: 'Hartwell Manufacturing Inc',
      alertId: 'ALT-2025-06-0514',
      amount: '$840,000',
      counterparty: 'Zhengda Industrial Supply Co Ltd (Hong Kong)',
      riskScore: '65/100',
      priority: 'High — L2'
    },
    logs: []
  };
  
  writeJson(logPath, initialData);
  console.log(`✓ Initialized process log: ${logPath}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Starting ${PROCESS_ID} - Clean client, problematic counterparty`);
  console.log('═══════════════════════════════════════════════════════════\n');

  initializeProcess();
  await updateProcessListStatus('In Progress');

  // Steps 1-7: Standard processing
  for (let i = 0; i < 7; i++) {
    const step = steps[i];
    console.log(`\n[${step.id}] ${step.title_s}`);

    updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_p, reasoning: [], artifacts: [], status: 'processing' });
    await delay(2000);

    updateProcessLog({ id: step.id, timestamp: step.timestamp, title: step.title_s, reasoning: step.reasoning, artifacts: step.artifacts, status: 'success' });
    await delay(1500);
    
    // Update risk score at step 7
    if (step.id === 'step7') {
      const logPath = path.join(PUBLIC_DATA_DIR, `process_${PROCESS_ID}.json`);
      const data = readJson(logPath);
      if (data && data.keyDetails) {
        data.keyDetails.riskScore = '82/100';
      }
      writeJson(logPath, data);
      console.log('  ↳ Risk score updated to 82/100');
    }
  }

  // Step 8: HITL Decision (3-way choice)
  const step8 = steps[7];
  console.log(`\n[${step8.id}] ${step8.title_s}`);

  updateProcessLog({ id: step8.id, timestamp: step8.timestamp, title: step8.title_p, reasoning: [], artifacts: [], status: 'processing' });
  await delay(2000);

  updateProcessLog({ id: step8.id, timestamp: step8.timestamp, title: step8.title_s, reasoning: step8.reasoning, artifacts: step8.artifacts, status: 'warning' });
  await updateProcessListStatus('Needs Attention');
  console.log('  ↳ Waiting for analyst decision (3 options)...');

  const receivedSignal = await waitForAnySignal(['OPTION_A_004', 'OPTION_B_004', 'OPTION_C_004']);
  console.log(`  ✓ Decision received: ${receivedSignal}`);

  updateProcessLog({ id: step8.id, timestamp: step8.timestamp, title: step8.title_s, reasoning: step8.reasoning, artifacts: step8.artifacts, status: 'completed' });
  await updateProcessListStatus('Done');
  await delay(1500);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`${PROCESS_ID} simulation complete — ended at HITL decision`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Error running simulation:', err);
  process.exit(1);
});
