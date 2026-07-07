<template>
  <PageContainer>
    <div class="space-y-4">
      <!-- Header -->
      <div class="header-section">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <button class="back-btn" @click="goBack" title="Back to Admin Hub">←</button>
            <h1 class="page-title">Grant Proposal Letter Writer</h1>
          </div>
          <p class="page-subtitle">AI-powered tool to generate compelling grant proposals and cover letters</p>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="layout-grid">
        <!-- Left: Form -->
        <div class="form-column">
          <AppCard title="Grant Information">
            <div class="form-group">
              <label>Grant Name</label>
              <AppInput
                v-model="form.grantName"
                placeholder="e.g., National Wildlife Federation Conservation Grant"
              />
            </div>

            <div class="form-group">
              <label>Funding Organization</label>
              <AppInput
                v-model="form.organization"
                placeholder="e.g., National Wildlife Federation"
              />
            </div>

            <div class="form-group">
              <label>Amount Requested ($)</label>
              <AppInput
                v-model.number="form.fundingAmount"
                type="number"
                placeholder="100000"
              />
            </div>

            <div class="form-group">
              <label>Application Deadline</label>
              <AppInput
                v-model="form.deadline"
                type="date"
              />
            </div>
          </AppCard>

          <AppCard title="Sanctuary Information">
            <div class="form-group">
              <label>Sanctuary Name</label>
              <AppInput
                v-model="form.sanctuaryName"
                placeholder="Your Sanctuary Name"
              />
            </div>

            <div class="form-group">
              <label>Mission Statement</label>
              <textarea
                v-model="form.mission"
                class="textarea-input"
                placeholder="Brief description of your sanctuary's mission and core values..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Years in Operation</label>
              <AppInput
                v-model.number="form.yearsInOperation"
                type="number"
                placeholder="5"
              />
            </div>

            <div class="form-group">
              <label>501(c)(3) Status</label>
              <AppSelect
                v-model="form.nonprofitStatus"
                :options="[
                  { label: 'Yes, 501(c)(3) registered', value: 'yes' },
                  { label: 'Pending 501(c)(3) status', value: 'pending' },
                  { label: 'Working with fiscal sponsor', value: 'fiscal' },
                ]"
              />
            </div>
          </AppCard>

          <AppCard title="Project Details">
            <div class="form-group">
              <label>Project Title</label>
              <AppInput
                v-model="form.projectTitle"
                placeholder="e.g., Reptile Conservation and Breeding Program"
              />
            </div>

            <div class="form-group">
              <label>Primary Focus Area</label>
              <AppSelect
                v-model="form.focusArea"
                :options="focusAreaOptions"
              />
            </div>

            <div class="form-group">
              <label>Species or Ecosystems Involved</label>
              <AppInput
                v-model="form.species"
                placeholder="e.g., Endangered Reptile Species, Tropical Rainforest Habitat"
              />
            </div>

            <div class="form-group">
              <label>Project Description & Impact</label>
              <textarea
                v-model="form.projectDescription"
                class="textarea-input"
                placeholder="Describe what this funding will support and how it will create positive impact. Include specific goals and expected outcomes..."
                rows="5"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Current Challenges</label>
              <textarea
                v-model="form.challenges"
                class="textarea-input"
                placeholder="What challenges is your organization currently facing that this grant would help solve?"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Key Accomplishments & Track Record</label>
              <textarea
                v-model="form.accomplishments"
                class="textarea-input"
                placeholder="Highlight your sanctuary's major successes, partnerships, and conservation achievements..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Timeline for Project Completion</label>
              <AppInput
                v-model="form.timeline"
                placeholder="e.g., 12 months, 2 years, Ongoing"
              />
            </div>

            <div class="form-group">
              <label>Expected Measurable Outcomes</label>
              <textarea
                v-model="form.outcomes"
                class="textarea-input"
                placeholder="How will you measure success? E.g., number of animals saved, breeding program success rates, educational programs reach..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Budget Highlights (Optional)</label>
              <textarea
                v-model="form.budgetHighlights"
                class="textarea-input"
                placeholder="E.g., 40% Staff, 30% Facility, 20% Research, 10% Education"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Additional Notes</label>
              <textarea
                v-model="form.additionalNotes"
                class="textarea-input"
                placeholder="Any other information relevant to this grant application..."
                rows="2"
              ></textarea>
            </div>
          </AppCard>

          <div class="generate-button-row">
            <AppButton
              variant="primary"
              size="lg"
              @click="generateLetter"
              :disabled="!isFormValid || isGenerating"
            >
              {{ isGenerating ? '✨ Generating...' : '✨ Generate Proposal Letter' }}
            </AppButton>
            <AppButton
              variant="secondary"
              size="lg"
              @click="resetForm"
            >
              ⟲ Clear Form
            </AppButton>
          </div>
        </div>

        <!-- Right: Preview -->
        <div class="preview-column">
          <div v-if="generatedLetter" class="letter-preview-card">
            <div class="letter-header">
              <h2>Generated Proposal Letter</h2>
              <div class="letter-actions">
                <button class="action-btn" @click="copyLetter" title="Copy to clipboard">
                  📋
                </button>
                <button class="action-btn" @click="downloadLetter" title="Download as text">
                  ⬇️
                </button>
                <button class="action-btn" @click="printLetter" title="Print">
                  🖨️
                </button>
              </div>
            </div>

            <div class="letter-content">
              <div class="letter-body">{{ generatedLetter }}</div>
            </div>

            <div class="edit-section">
              <h3>Edit Letter</h3>
              <p class="edit-hint">Make adjustments before submitting:</p>
              <textarea
                v-model="generatedLetter"
                class="edit-textarea"
              ></textarea>
            </div>

            <div class="letter-actions-footer">
              <AppButton variant="primary" @click="copyLetter">
                📋 Copy to Clipboard
              </AppButton>
              <AppButton variant="secondary" @click="downloadLetter">
                ⬇️ Download (TXT)
              </AppButton>
              <AppButton variant="secondary" @click="downloadAsDocx">
                📄 Export to Word
              </AppButton>
            </div>

            <div class="tips-box">
              <h4>Tips for Success:</h4>
              <ul>
                <li>Customize the letter with specific names and dates</li>
                <li>Add your official letterhead when printing</li>
                <li>Have a board member or executive director sign the final version</li>
                <li>Follow any specific formatting guidelines in the grant requirements</li>
                <li>Keep a copy for your records</li>
              </ul>
            </div>
          </div>

          <div v-else class="empty-preview">
            <div class="empty-icon">✍️</div>
            <h3>Generate a Letter</h3>
            <p>Fill out the form on the left and click "Generate Proposal Letter" to create your AI-assisted grant proposal.</p>
            <div class="preview-tips">
              <h4>What You'll Get:</h4>
              <ul>
                <li>Professional grant proposal letter</li>
                <li>Compelling narrative of your work</li>
                <li>Clear funding request justification</li>
                <li>Measurable outcomes explained</li>
                <li>Fully editable before export</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, AppInput, AppSelect } from '../../ui'
import { useUIStore } from '../../../stores/ui'

const ui = useUIStore()

// Load selected grant data if available
onMounted(() => {
  const selectedGrantJson = localStorage.getItem('selectedGrantForLetter')
  if (selectedGrantJson) {
    try {
      const grant = JSON.parse(selectedGrantJson)
      form.value.grantName = grant.name
      form.value.organization = grant.organization
      form.value.fundingAmount = grant.amount
      form.value.deadline = grant.deadline
      // Clear from storage after loading
      localStorage.removeItem('selectedGrantForLetter')
    } catch (e) {
      // Silently fail
    }
  }
})

const form = ref({
  grantName: '',
  organization: '',
  fundingAmount: null,
  deadline: '',
  sanctuaryName: '',
  mission: '',
  yearsInOperation: null,
  nonprofitStatus: 'yes',
  projectTitle: '',
  focusArea: '',
  species: '',
  projectDescription: '',
  challenges: '',
  accomplishments: '',
  timeline: '',
  outcomes: '',
  budgetHighlights: '',
  additionalNotes: '',
})

const focusAreaOptions = [
  { label: 'Conservation & Habitat Protection', value: 'conservation' },
  { label: 'Captive Breeding & Species Recovery', value: 'breeding' },
  { label: 'Rescue & Rehabilitation', value: 'rescue' },
  { label: 'Education & Outreach', value: 'education' },
  { label: 'Research & Science', value: 'research' },
  { label: 'Infrastructure & Facilities', value: 'infrastructure' },
  { label: 'Veterinary Care & Health', value: 'veterinary' },
  { label: 'Community & Economic Development', value: 'community' },
]

const generatedLetter = ref('')
const isGenerating = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.grantName &&
    form.value.fundingAmount &&
    form.value.sanctuaryName &&
    form.value.mission &&
    form.value.projectTitle &&
    form.value.focusArea &&
    form.value.projectDescription
  )
})

const generateLetter = async () => {
  if (!isFormValid.value) {
    ui.showToast('Please fill out all required fields', 'error')
    return
  }

  isGenerating.value = true
  try {
    // Generate a professional, realistic grant proposal letter
    const letter = generateProposalLetter()
    generatedLetter.value = letter
    ui.showToast('Proposal letter generated successfully!')
  } catch (error) {
    ui.showToast('Error generating letter', 'error')
    generatedLetter.value = ''
  } finally {
    isGenerating.value = false
  }
}

const generateProposalLetter = () => {
  const date = new Date()
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const nonprofitStatus = {
    yes: 'registered 501(c)(3) non-profit organization',
    pending: 'organization with pending 501(c)(3) status',
    fiscal: 'organization working with a fiscal sponsor',
  }

  const focusAreaText = {
    conservation: 'wildlife conservation and habitat protection',
    breeding: 'captive breeding and species recovery programs',
    rescue: 'animal rescue and rehabilitation services',
    education: 'environmental education and public outreach',
    research: 'conservation research and science',
    infrastructure: 'facility development and infrastructure',
    veterinary: 'animal health care and veterinary services',
    community: 'community engagement and economic development',
  }

  const letter = `${form.value.sanctuaryName}
[Organization Address]
[City, State ZIP]

${formattedDate}

[Recipient Name and Title]
${form.value.organization}
[Organization Address]
[City, State ZIP]

Dear [Recipient Name/Grant Review Committee]:

I am writing to request a grant of $${form.value.fundingAmount.toLocaleString()} from ${form.value.organization} to support the ${form.value.projectTitle}, a critical initiative that advances our mission to ${form.value.mission.toLowerCase()}.

ABOUT OUR ORGANIZATION

${form.value.sanctuaryName} is a ${nonprofitStatus[form.value.nonprofitStatus]} dedicated to ${form.value.mission} We have been serving this vital mission for ${form.value.yearsInOperation} years, during which we have earned recognition as a leader in our field. Our organization operates with a deep commitment to conservation, animal welfare, and community engagement.

Our track record of success includes:
${form.value.accomplishments
  .split('\n')
  .filter(line => line.trim())
  .map((line) => `• ${line.trim()}`)
  .join('\n')}

THE CHALLENGE

Despite our efforts, our organization faces significant challenges that limit our ability to expand and deepen our conservation impact:

${form.value.challenges
  .split('\n')
  .filter(line => line.trim())
  .map((line) => `• ${line.trim()}`)
  .join('\n')}

THE SOLUTION

The ${form.value.projectTitle} addresses these critical needs by focusing on ${focusAreaText[form.value.focusArea]}. This project will directly benefit ${form.value.species}, contributing to species recovery, habitat preservation, and community engagement in wildlife conservation.

PROJECT OVERVIEW

The requested grant of $${form.value.fundingAmount.toLocaleString()} will support the following:

${form.value.projectDescription
  .split('\n')
  .filter(line => line.trim())
  .map((line) => `• ${line.trim()}`)
  .join('\n')}

TIMELINE AND IMPLEMENTATION

The project will be completed within ${form.value.timeline}. Our experienced team is prepared to implement this initiative immediately upon receiving funding. We have established partnerships and secured necessary permissions to move forward efficiently.

MEASURABLE OUTCOMES

We are committed to demonstrating the impact of this grant through clear, measurable outcomes:

${form.value.outcomes
  .split('\n')
  .filter(line => line.trim())
  .map((line) => `• ${line.trim()}`)
  .join('\n')}

We will provide regular progress reports to ${form.value.organization} documenting the achievements and impact of this grant.

BUDGET ALLOCATION

The requested funds will be allocated as follows to ensure maximum impact:
${form.value.budgetHighlights ? form.value.budgetHighlights.split('\n').filter(line => line.trim()).map((line) => `• ${line.trim()}`).join('\n') : '• Personnel (45%)\n• Program Implementation (35%)\n• Research and Monitoring (15%)\n• Administrative (5%)'}

WHY PARTNER WITH US

${form.value.sanctuaryName} is positioned to deliver exceptional results with your support:

• Proven track record of successful conservation initiatives
• Dedicated team of experienced professionals
• Strong community partnerships and local support
• Commitment to transparency and accountability
• Evidence-based approaches to conservation
• Alignment with the goals and values of ${form.value.organization}

CONCLUSION

The ${form.value.projectTitle} represents a unique opportunity for ${form.value.organization} to make a transformative difference in wildlife conservation and animal welfare. Your investment in our organization will directly contribute to species preservation, habitat protection, and a more sustainable future.

We are enthusiastic about the possibility of partnering with ${form.value.organization} and would welcome the opportunity to discuss this proposal in greater detail. Please feel free to contact us to answer any questions or to schedule a conversation about how we can work together to achieve conservation success.

Thank you for considering this request. We look forward to the possibility of partnering with your foundation.

Sincerely,

[Your Name]
[Your Title]
${form.value.sanctuaryName}
[Phone Number]
[Email Address]

---
APPENDICES (To be attached separately):
• IRS Form 501(c)(3) Letter
• Audited Financial Statements
• List of Board Members
• Letters of Support from Partners
• Project Timeline and Detailed Budget
• Research and References${form.value.additionalNotes ? '\n• Additional Documentation: ' + form.value.additionalNotes.split('\n')[0] : ''}`

  return letter
}

const copyLetter = () => {
  navigator.clipboard.writeText(generatedLetter.value)
  ui.showToast('Letter copied to clipboard!')
}

const downloadLetter = () => {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedLetter.value))
  element.setAttribute('download', `${form.value.sanctuaryName}-grant-proposal.txt`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  ui.showToast('Letter downloaded!')
}

const downloadAsDocx = () => {
  // For Word document export, we'll use a simple approach
  // In production, you'd use a library like docx or html-to-pdf
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Calibri, Arial; line-height: 1.5; margin: 1in; }
          h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; }
          p { font-size: 11pt; margin: 6pt 0; }
        </style>
      </head>
      <body>
        <pre>${generatedLetter.value}</pre>
      </body>
    </html>
  `

  const element = document.createElement('a')
  const file = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  element.href = URL.createObjectURL(file)
  element.download = `${form.value.sanctuaryName}-grant-proposal.docx`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  ui.showToast('Document exported!')
}

const printLetter = () => {
  const printWindow = window.open('', '', 'height=400,width=800')
  printWindow.document.write('<pre>' + generatedLetter.value + '</pre>')
  printWindow.document.close()
  printWindow.print()
}

const resetForm = () => {
  form.value = {
    grantName: '',
    organization: '',
    fundingAmount: null,
    deadline: '',
    sanctuaryName: '',
    mission: '',
    yearsInOperation: null,
    nonprofitStatus: 'yes',
    projectTitle: '',
    focusArea: '',
    species: '',
    projectDescription: '',
    challenges: '',
    accomplishments: '',
    timeline: '',
    outcomes: '',
    budgetHighlights: '',
    additionalNotes: '',
  }
  generatedLetter.value = ''
  ui.showToast('Form cleared')
}

const goBack = () => {
  ui.setCurrentTab('admin-hub')
}
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }

.header-section {
  margin-bottom: 20px;
}

.back-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}

.back-btn:hover {
  background: var(--mint);
  border-color: var(--mint);
  color: white;
  transform: translateX(-2px);
}

.page-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  font-family: 'Fredoka One', sans-serif;
}

.page-subtitle {
  font-size: 13px;
  color: var(--ink-3);
  margin: 6px 0 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-column,
.preview-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.textarea-input {
  width: 100%;
  padding: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  resize: vertical;
  line-height: 1.5;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--mint);
  box-shadow: 0 0 0 2px rgba(78, 255, 197, 0.1);
}

.generate-button-row {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.letter-preview-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.letter-header h2 {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.letter-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--surface);
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--border);
  transform: translateY(-2px);
}

.letter-content {
  flex: 1;
  min-height: 300px;
  margin-bottom: 16px;
}

.letter-body {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  color: var(--ink-2);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.edit-section {
  margin-bottom: 16px;
}

.edit-section h3 {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.edit-hint {
  font-size: 11px;
  color: var(--ink-3);
  margin: 0 0 8px;
}

.edit-textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--ink);
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--mint);
  box-shadow: 0 0 0 2px rgba(78, 255, 197, 0.1);
}

.letter-actions-footer {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tips-box {
  padding: 12px;
  background: rgba(78, 255, 197, 0.08);
  border: 1px solid var(--mint);
  border-radius: 6px;
}

.tips-box h4 {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
  margin: 0 0 8px;
  letter-spacing: 0.03em;
}

.tips-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-box li {
  font-size: 11px;
  color: var(--ink-2);
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.tips-box li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--mint);
  font-weight: 700;
}

.empty-preview {
  background: var(--surface-2);
  border: 2px dashed var(--border);
  border-radius: var(--r);
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-preview h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 8px;
}

.empty-preview p {
  font-size: 12px;
  color: var(--ink-3);
  margin: 0 0 16px;
}

.preview-tips {
  text-align: left;
}

.preview-tips h4 {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
  margin: 0 0 8px;
  letter-spacing: 0.03em;
}

.preview-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-tips li {
  font-size: 11px;
  color: var(--ink-2);
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.preview-tips li:before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--mint);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
