const fs = require('fs');
const path = require('path');

const PROCESS_ID = 'AML_001';
const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(PROJECT_ROOT, 'public/data');

// Helper functions
function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateProcessLog(processId, newLog) {
  const logFilePath = path.join(PUBLIC_DATA_DIR, `${processId}_log.json`);
  let logs = readJson(logFilePath) || [];
  logs.push(newLog);
  writeJson(logFilePath, logs);
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
    const casesFilePath = path.join(PUBLIC_DATA_DIR, 'cases.json');
    let cases = readJson(casesFilePath) || [];
    const caseIndex = cases.findIndex(c => c.id === processId);
    if (caseIndex !== -1) {
      cases[caseIndex].status = status;
      writeJson(casesFilePath, cases);
    }
  }
}

async function waitForEmail() {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  console.log(`[${PROCESS_ID}] Waiting for email to be sent...`);
  
  while (true) {
    try {
      const response = await fetch(`${API_URL}/email-status`);
      if (response.ok) {
        const data = await response.json();
        if (data.sent) {
          console.log(`[${PROCESS_ID}] Email sent, continuing...`);
          return;
        }
      }
    } catch (error) {
      console.log(`[${PROCESS_ID}] Polling email status...`);
    }
    await delay(1000);
  }
}

// Step definitions
const steps = [
  {
    id: 1,
    timestamp: 'Mar 3, 10:12 AM',
    title_p: 'Receiving investigation case from Pega AIM...',
    title_s: 'Investigation case INV-2025-03-0412 received from Pega AIM: $1.9M wire from BorderLine Logistics LLC to Transportes del Norte SA de CV, Mexico',
    reasoning: [
      'Pega Alert Intake case ALT-2025-03-0871 created and processed',
      'Alert source: Transaction Monitoring',
      'Triggered rule 6: Transfer amount exceeding $500,000 to new beneficiary',
      'Triggered rule 11: First transaction to Mexico-based entity on this account',
      'Pega enrichment completed: customer profile, KYC file, 24-month transaction history, beneficial ownership records assembled',
      'DLA network indexed: subject, account, transaction, and beneficiary vertices created',
      'Risk score assigned: 68/100',
      'Priority: High — routed to L2 investigation queue',
      'Customer profile: BorderLine Logistics LLC, San Antonio TX, commercial freight and last-mile delivery, account open since 2017'
    ],
    artifacts: [
      { id: 'txn_details_1', type: 'file', label: 'Transaction Details', pdfPath: '/data/aml_001_transaction_details.pdf' },
      { id: 'rules_applied_1', type: 'json', label: 'View Rules Applied', data: { rules: ['Rule 6: Transfer > $500k to new beneficiary', 'Rule 11: First transaction to Mexico-based entity'] } },
      { id: 'customer_profile_1', type: 'file', label: 'Customer Profile', pdfPath: '/data/aml_001_customer_profile.pdf' },
      { id: 'kyc_file_1', type: 'file', label: 'KYC File', pdfPath: '/data/aml_001_kyc_file.pdf' },
      { id: 'txn_history_1', type: 'file', label: 'Transaction History 24mo', pdfPath: '/data/aml_001_transaction_history_24mo.pdf' },
      { id: 'beneficial_ownership_1', type: 'file', label: 'Beneficial Ownership Records', pdfPath: '/data/aml_001_beneficial_ownership.pdf' },
      { id: 'dla_network_1', type: 'json', label: 'DLA Network Graph', data: { vertices: ['BorderLine Logistics LLC', 'Account #8874102', 'Transaction $1.9M', 'Transportes del Norte SA de CV'], edges: 4 } }
    ],
    keyDetailsUpdate: {
      subject: 'BorderLine Logistics LLC',
      alertId: 'ALT-2025-03-0871',
      amount: '$1,900,000',
      counterparty: 'Transportes del Norte SA de CV',
      riskScore: '68/100',
      priority: 'High — L2'
    }
  },
  {
    id: 2,
    timestamp: 'Mar 3, 10:14 AM',
    title_p: 'Verifying beneficiary Transportes del Norte SA de CV...',
    title_s: 'Beneficiary "Transportes del Norte SA de CV" verified as established Mexican logistics company',
    reasoning: [
      'SAT (Mexico tax registry) confirms active registration since 2004',
      'Registered activity: freight transportation and warehouse operations',
      'LinkedIn presence shows 300+ employees across three Mexican states',
      'No adverse media on LexisNexis or Google News',
      'No OFAC, UN, or EU sanctions matches',
      'Beneficiary appears legitimate — no concerns identified'
    ],
    artifacts: [
      { id: 'sat_registry_2', type: 'video', label: 'SAT Mexico Registry', videoPath: '/data/aml_001_sat_registry.webm' },
      { id: 'linkedin_2', type: 'video', label: 'LinkedIn', videoPath: '/data/aml_001_linkedin_beneficiary.webm' },
      { id: 'lexisnexis_2', type: 'video', label: 'LexisNexis', videoPath: '/data/aml_001_lexisnexis_beneficiary.webm' }
    ]
  },
  {
    id: 3,
    timestamp: 'Mar 3, 10:18 AM',
    title_p: 'Analyzing customer business context and public filings...',
    title_s: 'Customer business context supports a Mexico expansion — USPS border-state contract identified',
    reasoning: [
      'SEC EDGAR filing shows BorderLine Logistics disclosed a USPS last-mile delivery contract for TX, AZ, and NM in Q4 2024',
      'Contract value: $14M over 3 years',
      'Press release on company website confirms cross-border warehousing as part of fulfillment strategy',
      '$1.9M is plausible as upfront warehouse lease and fleet staging costs against a $14M contract'
    ],
    artifacts: [
      { id: 'sec_edgar_3', type: 'video', label: 'SEC EDGAR Filing', videoPath: '/data/aml_001_sec_edgar.webm' },
      { id: 'press_release_3', type: 'video', label: 'Company Press Release', videoPath: '/data/aml_001_press_release.webm' }
    ]
  },
  {
    id: 4,
    timestamp: 'Mar 3, 10:23 AM',
    title_p: 'Reviewing 24-month transaction history for anomalies...',
    title_s: 'Source of funds concern: $2.4M in inbound wires from unrelated entity Orion Realty Partners LLC over past 6 months',
    reasoning: [
      '24-month transaction history review found 9 inbound wires from Orion Realty Partners LLC totaling $2.4M between September 2024 and February 2025',
      'Orion Realty Partners is not referenced anywhere in BorderLine\'s KYC file or declared business relationships',
      'A logistics company receiving recurring large payments from a real estate entity has no obvious commercial explanation',
      'The $1.9M Mexico wire was sent 11 days after the most recent $310,000 inbound from Orion Realty',
      'Possible that the Mexico wire is funded in part by these unexplained inflows rather than by BorderLine\'s operating revenue',
      'Customer\'s average monthly operating revenue is approximately $420,000 — the $1.9M wire exceeds 4 months of revenue without the Orion inflows'
    ],
    artifacts: [
      { id: 'orion_analysis_4', type: 'json', label: 'Orion Realty Inflow Analysis', data: { total_inflows: '$2.4M', wire_count: 9, period: 'Sep 2024 - Feb 2025', concern: 'Unexplained relationship' } },
      { id: 'txn_timeline_4', type: 'json', label: 'Transaction Timeline', data: { last_orion_wire: 'Feb 17, 2025 ($310k)', mexico_wire: 'Feb 28, 2025 ($1.9M)', days_apart: 11 } }
    ]
  },
  {
    id: 5,
    timestamp: 'Mar 3, 10:27 AM',
    title_p: 'Investigating Orion Realty Partners LLC...',
    title_s: 'Orion Realty Partners LLC investigated — registered Delaware entity with limited but verifiable footprint',
    reasoning: [
      'Delaware Division of Corporations shows Orion Realty Partners LLC registered in 2019',
      'Browser search found a basic company website listing commercial property management in Dallas-Fort Worth area',
      'Texas Comptroller of Public Accounts shows active franchise tax status',
      'BBB listing found with 3 reviews, no complaints',
      'No adverse media on Google News or LexisNexis',
      'Entity appears to be a small but real operating business — not a shell',
      'However, the commercial relationship between a logistics company and a real estate management firm is still unexplained'
    ],
    artifacts: [
      { id: 'delaware_corp_5', type: 'video', label: 'Delaware Division of Corporations', videoPath: '/data/aml_001_delaware_corp.webm' },
      { id: 'orion_website_5', type: 'video', label: 'Orion Realty Website', videoPath: '/data/aml_001_orion_website.webm' },
      { id: 'texas_comptroller_5', type: 'video', label: 'Texas Comptroller', videoPath: '/data/aml_001_texas_comptroller.webm' },
      { id: 'bbb_5', type: 'video', label: 'BBB', videoPath: '/data/aml_001_bbb.webm' }
    ]
  },
  {
    id: 6,
    timestamp: 'Mar 3, 10:31 AM',
    title_p: 'Updating risk assessment...',
    title_s: 'Risk score updated to 74/100',
    reasoning: [
      'Beneficiary verified as legitimate — no counterparty concern',
      'Customer has documented business reason for Mexico transaction',
      'However, $2.4M in unexplained inflows from an unrelated industry creates a source of funds question',
      'The Mexico wire may be clean but the money funding it may not be',
      'Cannot close without understanding the Orion Realty relationship'
    ],
    artifacts: [
      { id: 'risk_assessment_6', type: 'json', label: 'Risk Assessment', data: { previous_score: '68/100', updated_score: '74/100', reason: 'Source of funds concern identified' } }
    ],
    keyDetailsUpdate: {
      riskScore: '74/100'
    }
  },
  {
    id: 7,
    timestamp: 'Mar 3, 10:34 AM',
    title_p: 'Generating RFI documentation request...',
    title_s: 'RFI generated: Documentation requested from BorderLine Logistics LLC',
    reasoning: [
      'RFI Reference: RFI-2025-03-0341',
      'Due date: 03/17/2025 (10 business days)',
      'SLA tracking: Active',
      'Requested: warehouse lease agreement with Transportes del Norte, board resolution approving Mexico expansion spend, USPS contract excerpt confirming cross-border scope',
      'Additionally requested: explanation of business relationship with Orion Realty Partners LLC and documentation supporting the 9 inbound wire transfers totaling $2.4M',
      'RFI framed as routine enhanced due diligence review triggered by increased transaction activity'
    ],
    artifacts: [
      { 
        id: 'rfi_email_7', 
        type: 'email_draft', 
        label: 'RFI Email to Customer', 
        data: {
          isIncoming: false,
          from: 'aml-investigations@meridianbank.com',
          to: 'compliance@borderlinelogistics.com',
          subject: 'Routine Document Request — BorderLine Logistics LLC',
          body: 'Dear BorderLine Logistics Compliance Team,\n\nAs part of our routine enhanced due diligence procedures, we are requesting documentation related to your recent international transaction activity.\n\nPlease provide the following by March 17, 2025:\n\n1. Warehouse lease agreement with Transportes del Norte SA de CV\n2. Board resolution approving Mexico expansion expenditure\n3. USPS contract excerpt confirming cross-border warehousing requirements\n4. Explanation of business relationship with Orion Realty Partners LLC\n5. Documentation supporting the 9 inbound wire transfers from Orion Realty Partners LLC (totaling $2.4M, September 2024 - February 2025)\n\nThis request is part of our standard review process triggered by increased transaction activity. Please contact us if you have any questions.\n\nReference: RFI-2025-03-0341\n\nBest regards,\nMeridian Bank AML Investigations Team'
        }
      }
    ],
    isHitl: true
  },
  {
    id: 8,
    timestamp: 'Mar 7, 11:22 AM',
    title_p: 'Processing RFI response documentation...',
    title_s: 'RFI response received: Complete documentation provided — Orion Realty relationship explained',
    reasoning: [
      'Warehouse lease agreement provided: 5-year lease, 40,000 sq ft in Monterrey, $1.52M upfront (deposit plus 12 months prepaid)',
      'Board resolution dated January 2025 approves up to $2.5M for Mexico operations',
      'USPS contract excerpt confirms bonded warehousing requirement within 50 miles of Laredo crossing',
      'Remaining $380,000 accounted for by fleet staging invoice from Transportes del Norte',
      'Orion Realty relationship explained: BorderLine subleases 3 warehouse properties in Dallas-Fort Worth from Orion Realty and also provides last-mile delivery services for Orion\'s commercial tenants',
      'Sublease agreements provided for all 3 properties — monthly rents and service fees total approximately $265,000/month which is consistent with the $2.4M over 6 months',
      'Orion Realty\'s payments are for a legitimate logistics-real estate services arrangement'
    ],
    artifacts: [
      { 
        id: 'rfi_response_email_8', 
        type: 'email_draft', 
        label: 'RE: Routine Document Request...', 
        data: {
          isIncoming: true,
          from: 'compliance@borderlinelogistics.com',
          to: 'aml-investigations@meridianbank.com',
          subject: 'RE: Routine Document Request — BorderLine Logistics LLC',
          body: 'Dear AML Investigations Team,\n\nThank you for your inquiry. Please find attached the requested documentation:\n\n1. Warehouse lease agreement with Transportes del Norte (Monterrey facility)\n2. Board resolution from January 2025 board meeting\n3. USPS contract excerpt (Section 4.2 - Cross-border requirements)\n4. Orion Realty business relationship documentation\n\nRegarding Orion Realty Partners: We sublease three warehouse properties from them in the Dallas-Fort Worth area and provide last-mile delivery services for their commercial tenants. The attached sublease agreements and service agreement detail this arrangement.\n\nPlease let us know if you need any additional information.\n\nBest regards,\nBorderLine Logistics Compliance'
        }
      },
      { id: 'warehouse_lease_8', type: 'file', label: 'Warehouse_Lease_Monterrey.pdf', pdfPath: '/data/aml_001_warehouse_lease.pdf' },
      { id: 'board_resolution_8', type: 'file', label: 'Board_Resolution_Jan2025.pdf', pdfPath: '/data/aml_001_board_resolution.pdf' },
      { id: 'usps_contract_8', type: 'file', label: 'USPS_Contract_Excerpt.pdf', pdfPath: '/data/aml_001_usps_contract.pdf' },
      { id: 'fleet_staging_8', type: 'file', label: 'Fleet_Staging_Invoice.pdf', pdfPath: '/data/aml_001_fleet_staging.pdf' },
      { id: 'orion_sublease_1_8', type: 'file', label: 'Orion_Sublease_1.pdf', pdfPath: '/data/aml_001_orion_sublease_1.pdf' },
      { id: 'orion_sublease_2_8', type: 'file', label: 'Orion_Sublease_2.pdf', pdfPath: '/data/aml_001_orion_sublease_2.pdf' },
      { id: 'orion_sublease_3_8', type: 'file', label: 'Orion_Sublease_3.pdf', pdfPath: '/data/aml_001_orion_sublease_3.pdf' },
      { id: 'orion_service_8', type: 'file', label: 'Orion_Service_Agreement.pdf', pdfPath: '/data/aml_001_orion_service_agreement.pdf' }
    ]
  },
  {
    id: 9,
    timestamp: 'Mar 7, 11:30 AM',
    title_p: 'Verifying submitted documentation...',
    title_s: 'Document verification: All documents internally consistent and externally verifiable',
    reasoning: [
      'Lease amounts, dates, and counterparty names align across all submitted documents',
      'Orion sublease monthly totals reconcile with the inbound wire amounts and frequency',
      'Board resolution pre-dates the Mexico wire and authorizes the spend amount',
      'USPS contract confirms the operational need for Mexican warehousing',
      'Orion Realty\'s franchise tax filing and public presence corroborate the sublease arrangement',
      'Wire amount fully accounted for: $1.52M lease plus $380K staging equals $1.9M',
      'Source of funds concern resolved: Orion inflows are legitimate sublease and service revenue'
    ],
    artifacts: [
      { 
        id: 'doc_verification_9', 
        type: 'json', 
        label: 'Document Verification Summary', 
        data: { 
          lease_verified: true, 
          board_resolution_verified: true, 
          usps_contract_verified: true,
          orion_relationship_verified: true,
          wire_amount_reconciled: '$1.52M + $380K = $1.9M',
          conclusion: 'All documentation verified'
        } 
      }
    ]
  },
  {
    id: 10,
    timestamp: 'Mar 7, 11:35 AM',
    title_p: 'Finalizing investigation and updating risk score...',
    title_s: 'Alert resolved: All triggered rules addressed, source of funds verified. Risk score updated to 20/100',
    reasoning: [
      'Beneficiary is legitimate with 20-year operating history',
      'Customer has documented and verifiable business reason for the transaction',
      'Wire amount fully reconciled against lease and staging costs',
      'Source of funds question resolved — Orion Realty payments are documented sublease revenue',
      'Customer responded promptly, completely, and with no inconsistencies',
      'No indicators of layering, structuring, or illicit fund movement'
    ],
    artifacts: [
      { id: 'case_summary_10', type: 'file', label: 'Case Summary', pdfPath: '/data/aml_001_case_summary.pdf' },
      { id: 'txn_details_final_10', type: 'file', label: 'Transaction Details', pdfPath: '/data/aml_001_transaction_details.pdf' },
      { 
        id: 'slack_notification_10', 
        type: 'json', 
        label: 'Slack notification', 
        data: { 
          channel: '#aml-investigations', 
          message: 'Case INV-2025-03-0412 (BorderLine Logistics) resolved: Risk score 20/100. No SAR filing required.' 
        } 
      }
    ],
    keyDetailsUpdate: {
      riskScore: '20/100'
    }
  }
];

// Main execution
async function runSimulation() {
  console.log(`[${PROCESS_ID}] Starting simulation...`);
  
  for (const step of steps) {
    // Processing state
    updateProcessLog(PROCESS_ID, {
      id: step.id,
      timestamp: step.timestamp,
      title: step.title_p,
      reasoning: [],
      artifacts: [],
      status: 'processing',
      keyDetailsUpdate: step.keyDetailsUpdate || null
    });
    
    if (step.isHitl) {
      await updateProcessListStatus(PROCESS_ID, 'Needs Attention');
    }
    
    await delay(2000);
    
    // HITL handling for step 7
    if (step.id === 7) {
      // Wait for email to be sent
      await waitForEmail();
    }
    
    // Success/completed state
    const finalStatus = (step.id === steps.length) ? 'completed' : 'success';
    updateProcessLog(PROCESS_ID, {
      id: step.id,
      timestamp: step.timestamp,
      title: step.title_s,
      reasoning: step.reasoning,
      artifacts: step.artifacts,
      status: finalStatus,
      keyDetailsUpdate: step.keyDetailsUpdate || null
    });
    
    // Update process list status
    if (step.id === steps.length) {
      await updateProcessListStatus(PROCESS_ID, 'Done');
    } else if (step.isHitl) {
      await updateProcessListStatus(PROCESS_ID, 'In Progress');
    }
    
    await delay(1500);
  }
  
  console.log(`[${PROCESS_ID}] Simulation completed.`);
}

runSimulation().catch(error => {
  console.error(`[${PROCESS_ID}] Simulation error:`, error);
  process.exit(1);
});
