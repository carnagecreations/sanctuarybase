<template>
  <PageContainer>
    <div class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <StatCard :number="String(donors.length)" label="Total Donors" />
        <StatCard number="0" label="This Year" />
      </div>

      <!-- Search -->
      <AppInput v-model="searchQuery" placeholder="Search donors by name or email..." />

      <!-- Incoming Zeffy Gifts -->
      <AppCard v-if="zeffyLoading || zeffyError || zeffyGifts.length">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-bold">Incoming Zeffy Gifts</div>
            <AppButton variant="secondary" size="sm" :disabled="zeffyLoading" @click="loadZeffyGifts">
              {{ zeffyLoading ? 'Loading…' : 'Refresh' }}
            </AppButton>
          </div>
          <div v-if="zeffyError" class="text-xs zeffy-error">{{ zeffyError }}</div>
          <div v-for="gift in zeffyGifts" :key="gift.id" class="zeffy-gift">
            <div>
              <div class="font-bold">{{ gift.donorName || 'Unknown donor' }}</div>
              <div class="text-xs text-gray-400">
                {{ gift.donorEmail || 'no email captured' }} ·
                {{ gift.amountCents != null ? formatCents(gift.amountCents) : 'amount unknown' }}
                <template v-if="gift.frequency">· {{ gift.frequency }}</template>
              </div>
              <div class="text-xs text-gray-400">{{ new Date(gift.receivedAt).toLocaleString() }}</div>
            </div>
            <AppButton variant="secondary" size="sm" @click="addGiftToCrm(gift)">Add to donor CRM</AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Log Donation -->
      <AppCard>
        <div class="space-y-3">
          <div class="text-sm font-bold">Log Donation</div>
          <AppInput v-model="newDonor.name" placeholder="Donor Name" />
          <AppInput v-model="newDonor.email" type="email" placeholder="Email (optional)" />
          <AppInput v-model="newDonor.phone" placeholder="Phone (optional)" />

          <div class="donation-type-row">
            <label><input type="radio" v-model="newDonor.type" value="monetary" /> Monetary</label>
            <label><input type="radio" v-model="newDonor.type" value="kind" /> In-Kind (Gift)</label>
          </div>

          <template v-if="newDonor.type === 'monetary'">
            <AppInput v-model="newDonor.amount" type="number" placeholder="Amount ($)" />
          </template>
          <template v-else>
            <AppInput v-model="newDonor.itemDescription" placeholder="Item description (feed, supplies, etc.)" />
            <AppInput v-model="newDonor.estimatedValue" type="number" placeholder="Estimated Value ($)" />
          </template>

          <AppButton variant="primary" @click="addDonor">Log Donation</AppButton>
        </div>
      </AppCard>

      <!-- Donors List -->
      <template v-if="filteredDonors.length > 0">
        <div class="space-y-2">
          <AppCard v-for="donor in filteredDonors" :key="donor.id" noPad>
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="font-bold">{{ donor.name }}</div>
                  <div class="text-xs text-gray-400">{{ donor.email }}</div>
                </div>
                <AppBadge v-if="donor.isMajor" type="success">Major Donor</AppBadge>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-700">
                <div>
                  <span class="text-gray-400">Phone:</span> {{ donor.phone }}
                </div>
                <div>
                  <span class="text-gray-400">Total Donations:</span> {{ donor.totalDonations }}
                </div>
                <div>
                  <span class="text-gray-400">Count:</span> {{ donor.donationCount }} times
                </div>
                <div>
                  <span class="text-gray-400">Last Donation:</span> {{ donor.lastDonation }}
                </div>
              </div>
              <div class="flex gap-2 pt-3">
                <AppButton
                  variant="secondary" size="sm"
                  :disabled="!donor.email || donor.email === 'N/A'"
                  @click="openThankYouEmail(donor)"
                >Email thank you</AppButton>
                <AppButton variant="secondary" size="sm" @click="toggleHistory(donor.id)">
                  {{ expandedDonorId === donor.id ? 'Hide history' : 'View history' }}
                </AppButton>
              </div>
              <div v-if="expandedDonorId === donor.id" class="text-xs pt-3 border-t border-gray-700 space-y-2">
                <div><span class="text-gray-400">Type:</span> {{ donor.type === 'kind' ? 'In-kind gift' : 'Monetary' }}</div>
                <div v-if="donor.description"><span class="text-gray-400">Item:</span> {{ donor.description }}</div>
                <div><span class="text-gray-400">Logged:</span> {{ formatTimestamp(donor.createdAt) }}</div>
                <div v-if="donor.source === 'zeffy'"><span class="text-gray-400">Source:</span> Zeffy webhook</div>
                <div class="zeffy-note">Per-gift history isn't tracked yet — this shows everything currently on record for this donor.</div>
              </div>
            </div>
          </AppCard>
        </div>
      </template>
      <EmptyState v-else icon="💝" title="No donors yet" message="Add your first donor to get started." />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDonorsStore } from '../../../stores/donors'
import { fetchZeffyDonations } from '../../../services/donationsService'
import PageContainer from '../../ui/PageContainer.vue'
import AppCard from '../../ui/AppCard.vue'
import AppInput from '../../ui/AppInput.vue'
import AppButton from '../../ui/AppButton.vue'
import AppBadge from '../../ui/AppBadge.vue'
import StatCard from '../../ui/StatCard.vue'
import EmptyState from '../../ui/EmptyState.vue'

const store = useDonorsStore()

const searchQuery = ref('')
const expandedDonorId = ref(null)

const zeffyGifts = ref([])
const zeffyLoading = ref(false)
const zeffyError = ref('')

const newDonor = ref({
  name: '',
  email: '',
  phone: '',
  type: 'monetary',
  amount: '',
  itemDescription: '',
  estimatedValue: '',
})

const donors = computed(() => store.donors)

const filteredDonors = computed(() => {
  return donors.value.filter(donor => {
    return searchQuery.value === '' ||
      donor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const addDonor = async () => {
  if (newDonor.value.name) {
    const donationValue = newDonor.value.type === 'monetary' ? newDonor.value.amount : newDonor.value.estimatedValue
    await store.addDonor({
      name: newDonor.value.name,
      email: newDonor.value.email || 'N/A',
      phone: newDonor.value.phone || 'N/A',
      type: newDonor.value.type,
      description: newDonor.value.type === 'kind' ? newDonor.value.itemDescription : undefined,
      totalDonations: donationValue ? `$${donationValue}` : '$0',
      donationCount: 1,
      lastDonation: 'Today',
      isMajor: false,
    })
    newDonor.value = { name: '', email: '', phone: '', type: 'monetary', amount: '', itemDescription: '', estimatedValue: '' }
  }
}

const loadZeffyGifts = async () => {
  zeffyLoading.value = true
  zeffyError.value = ''
  try {
    zeffyGifts.value = await fetchZeffyDonations()
  } catch (err) {
    zeffyError.value = err.message || 'Could not load Zeffy gifts'
  } finally {
    zeffyLoading.value = false
  }
}

const formatCents = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const addGiftToCrm = async (gift) => {
  await store.addDonor({
    name: gift.donorName || 'Unknown donor',
    email: gift.donorEmail || 'N/A',
    phone: 'N/A',
    type: 'monetary',
    totalDonations: gift.amountCents != null ? formatCents(gift.amountCents) : '$0',
    donationCount: 1,
    lastDonation: new Date(gift.receivedAt).toLocaleDateString(),
    isMajor: false,
    source: 'zeffy',
  })
  zeffyGifts.value = zeffyGifts.value.filter(g => g.id !== gift.id)
}

const toggleHistory = (id) => {
  expandedDonorId.value = expandedDonorId.value === id ? null : id
}

const formatTimestamp = (value) => {
  if (!value) return 'Unknown'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return isNaN(date) ? 'Unknown' : date.toLocaleString()
}

// No communications service exists yet to send mail from the app itself —
// this opens the staff member's own mail client instead of pretending to
// send, so nobody believes a thank-you went out when it didn't.
const openThankYouEmail = (donor) => {
  const subject = encodeURIComponent('Thank you for your gift to Saint Francis Rescue')
  const body = encodeURIComponent(`Hi ${donor.name},\n\nThank you so much for your generous gift`)
  window.location.href = `mailto:${donor.email}?subject=${subject}&body=${body}`
}

onMounted(() => {
  store.fetchDonors()
  loadZeffyGifts()
})
</script>

<style scoped>
.space-y-4 { display: flex; flex-direction: column; gap: 16px; }
.space-y-2 { display: flex; flex-direction: column; gap: 8px; }
.space-y-3 { display: flex; flex-direction: column; gap: 12px; }

.donation-type-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
}

.donation-type-row label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.donation-type-row input {
  cursor: pointer;
}

.grid { display: grid; }
.grid.grid-cols-2 { grid-template-columns: repeat(2, 1fr); gap: 12px; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.font-bold { font-weight: 800; }
.p-4 { padding: 16px; }
.pt-3 { padding-top: 12px; }
.pt-4 { padding-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.border-t { border-top: 1px solid var(--border); }
.border-gray-700 { border-color: var(--border); }
.flex { display: flex; }
.flex.items-start { align-items: flex-start; }
.flex.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.noPad { padding: 0; }

.zeffy-gift {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
}
.zeffy-gift:first-of-type { border-top: none; }
.zeffy-error { color: var(--danger, #e5484d); }
.zeffy-note { color: var(--ink-2); font-style: italic; }
</style>
