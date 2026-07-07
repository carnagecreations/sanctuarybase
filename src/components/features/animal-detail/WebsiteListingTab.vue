<template>
    <div>
      <SectionLabel>Website listing</SectionLabel>
      <AppCard>
        <div v-if="!isPublishable" class="not-publishable">
          <span class="warn-icon">⚠️</span>
          This animal's current status (<strong>{{ statusLabel(animal.status) }}</strong>) isn't shown on the public site.
          Set status to Available, In Foster, Sanctuary, or Adopted on the Profile tab to publish.
        </div>

        <div class="pub-header">
          <div class="pub-status">
            <span class="live-dot" :class="{ live: draft.siteAnimalId }"></span>
            <div>
              <div class="pub-title">{{ draft.siteAnimalId ? 'Live on website' : 'Not on website' }}</div>
              <div class="pub-meta">
                <template v-if="draft.siteAnimalId">Listed as {{ statusMapLabel }}</template>
                <template v-else>Publish to show {{ animal.name }} on the public site</template>
              </div>
            </div>
          </div>
          <a
            v-if="draft.siteAnimalId"
            class="view-link"
            :href="SITE_ORIGIN + '/animals.html'"
            target="_blank"
            rel="noopener"
          >View on site ↗</a>
        </div>

        <div class="edit-field" style="margin-top:12px">
          <div class="field-head">
            <label>Public description *</label>
            <button type="button" class="ai-btn" :disabled="writingBio" @click="writeWithAI">
              {{ writingBio ? '✨ Writing…' : '✨ Write with AI' }}
            </button>
          </div>
          <textarea v-model="draft.publicDescription" rows="4" placeholder="Their story, personality, how they came to the sanctuary…"></textarea>
          <p v-if="bioError" class="muted" style="color:var(--coral)">{{ bioError }}</p>
        </div>

        <div class="edit-field" style="margin-top:10px">
          <label>Photos <span class="muted">(first photo is the cover)</span></label>
          <div class="photo-grid">
            <div class="t" v-for="(u, i) in draft.publicPhotos" :key="u">
              <img :src="siteMediaUrl(u)" alt="" />
              <span v-if="i === 0" class="cover-tag">Cover</span>
              <button title="Remove" @click="draft.publicPhotos.splice(i, 1)">&times;</button>
            </div>
            <label class="add-photo" :class="{ busy: uploading }">
              <input type="file" accept="image/*" multiple @change="onFilesSelected" />
              <span class="add-icon">{{ uploading ? '…' : '＋' }}</span>
              <span>{{ uploading ? 'Uploading' : 'Add photos' }}</span>
            </label>
          </div>
          <p class="muted upload-msg">{{ uploadMsg }}</p>
        </div>

        <div class="toggle-row">
          <label class="toggle-card" :class="{ on: draft.needsFoster }">
            <input type="checkbox" v-model="draft.needsFoster" />
            <span class="toggle-emoji">🏠</span>
            <span class="toggle-text">
              <strong>Needs a foster home</strong>
              <small>Shows a foster call-out on their listing</small>
            </span>
          </label>
          <label class="toggle-card" :class="{ on: draft.isFeatured }">
            <input type="checkbox" v-model="draft.isFeatured" />
            <span class="toggle-emoji">⭐</span>
            <span class="toggle-text">
              <strong>Feature on home page</strong>
              <small>Spotlights them on the site's front page</small>
            </span>
          </label>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="pub-actions">
          <AppButton
            variant="primary"
            :loading="publishing"
            :disabled="!isPublishable"
            @click="publish"
          >{{ draft.siteAnimalId ? 'Update website listing' : 'Publish to website' }}</AppButton>
          <AppButton v-if="draft.siteAnimalId" variant="danger" :loading="publishing" @click="unpublish">Remove from website</AppButton>
        </div>
      </AppCard>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { AppCard, AppButton, SectionLabel } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { useAnimalsStore } from '../../../stores/animals'
import { useAnimalsAdminStore } from '../../../stores/animalsAdmin'
import { generateAnimalBio } from '../../../services/animalBioService'
import { SITE_ORIGIN, siteMediaUrl } from '../../../services/siteApi'

const props = defineProps({ animal: { type: Object, required: true } })

const ui = useUIStore()
const animalsStore = useAnimalsStore()
const animalsAdmin = useAnimalsAdminStore()

const publishing = ref(false)
const uploading = ref(false)
const uploadMsg = ref('')
const formError = ref('')
const writingBio = ref(false)
const bioError = ref('')

// Default the published photo set from the animal's main Profile photos —
// that's now the primary place photos get added — but keep it independently
// editable here in case the public listing should show a different subset.
const draft = reactive({
  siteAnimalId: props.animal.siteAnimalId || null,
  publicDescription: props.animal.publicDescription || '',
  publicPhotos: props.animal.publicPhotos?.length
    ? [...props.animal.publicPhotos]
    : (props.animal.photos ? [...props.animal.photos] : []),
  needsFoster: !!props.animal.needsFoster,
  isFeatured: !!props.animal.isFeatured,
})

// Internal care statuses map to the four public listing statuses; anything
// else (intake, quarantine, medical hold, transferred, deceased) isn't shown publicly.
const STATUS_MAP = { available: 'available', foster: 'fostered', adopted: 'adopted', sanctuary: 'resident' }
const STATUS_MAP_LABEL = { available: 'Available', fostered: 'In Foster', adopted: 'Adopted', resident: 'Sanctuary Resident' }

const publicStatus = computed(() => STATUS_MAP[props.animal.status] || null)
const isPublishable = computed(() => !!publicStatus.value)
const statusMapLabel = computed(() => STATUS_MAP_LABEL[publicStatus.value] || '')

const statusLabel = (s) => ({
  intake: 'Intake', quarantine: 'Quarantine', available: 'Available',
  foster: 'In Foster', adopted: 'Adopted', sanctuary: 'Sanctuary',
  medical: 'Medical Hold', transferred: 'Transferred', deceased: 'Deceased',
}[s] || s)

const writeWithAI = async () => {
  bioError.value = ''
  writingBio.value = true
  try {
    const notes = [props.animal.behaviorNotes, props.animal.generalNotes, props.animal.feedingNotes]
      .filter(Boolean).join('\n')
    const bio = await generateAnimalBio({
      name: props.animal.name,
      species: props.animal.species,
      breed: props.animal.breed || '',
      age: props.animal.age || '',
      sex: props.animal.sex || '',
      status: publicStatus.value,
      notes,
    })
    draft.publicDescription = bio
  } catch (err) {
    bioError.value = err.message || 'Could not generate a bio right now.'
  } finally {
    writingBio.value = false
  }
}

const onFilesSelected = async (e) => {
  const files = e.target.files
  if (!files || !files.length) return
  uploading.value = true
  uploadMsg.value = ''
  try {
    const urls = await animalsAdmin.uploadImages(files)
    draft.publicPhotos.push(...urls)
    uploadMsg.value = `${urls.length} photo(s) added.`
  } catch (err) {
    uploadMsg.value = err.message || 'Upload failed.'
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

const publish = async () => {
  formError.value = ''
  if (!draft.publicDescription.trim()) {
    formError.value = 'Add a public description before publishing.'
    return
  }
  if (!draft.publicPhotos.length) {
    formError.value = 'Add at least one photo before publishing.'
    return
  }
  publishing.value = true
  try {
    const payload = {
      name: props.animal.name,
      species: props.animal.species,
      breed: props.animal.breed || '',
      age: props.animal.age || '',
      sex: props.animal.sex || '',
      status: publicStatus.value,
      description: draft.publicDescription,
      imageUrls: draft.publicPhotos,
      needsFoster: draft.needsFoster,
      isFeatured: draft.isFeatured,
    }
    const result = draft.siteAnimalId
      ? await animalsAdmin.editAnimal(draft.siteAnimalId, payload)
      : await animalsAdmin.addAnimal(payload)
    draft.siteAnimalId = result.id

    await animalsStore.updateAnimal(props.animal.id, {
      siteAnimalId: draft.siteAnimalId,
      publicDescription: draft.publicDescription,
      publicPhotos: draft.publicPhotos,
      needsFoster: draft.needsFoster,
      isFeatured: draft.isFeatured,
      sitePublishedAt: new Date().toISOString(),
    })
    ui.showToast(`${props.animal.name} is live on the website`)
  } catch (err) {
    formError.value = err.message || 'Failed to publish.'
  } finally {
    publishing.value = false
  }
}

const unpublish = async () => {
  if (!draft.siteAnimalId) return
  publishing.value = true
  try {
    await animalsAdmin.removeAnimal(draft.siteAnimalId)
    draft.siteAnimalId = null
    await animalsStore.updateAnimal(props.animal.id, { siteAnimalId: null, sitePublishedAt: null })
    ui.showToast(`${props.animal.name} removed from the website`)
  } catch (err) {
    formError.value = err.message || 'Failed to remove listing.'
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.not-publishable {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  color: var(--amber);
  background: rgba(217,119,6,.1);
  border: 1px solid rgba(217,119,6,.3);
  border-radius: var(--r);
  padding: 10px 12px;
  margin-bottom: 12px;
  line-height: 1.5;
}
.warn-icon { flex-shrink: 0; }

.pub-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
}
.pub-status { display: flex; align-items: center; gap: 10px; }
.live-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--ink-3); flex-shrink: 0; opacity: .5;
}
.live-dot.live {
  background: var(--mint); opacity: 1;
  box-shadow: 0 0 0 4px rgba(78,255,197,.15);
}
.pub-title { font-size: 13px; font-weight: 800; color: var(--ink); }
.pub-meta { font-size: 11px; color: var(--ink-3); font-weight: 600; }
.view-link {
  font-size: 11px; font-weight: 800; color: var(--mint);
  text-decoration: none; white-space: nowrap;
  padding: 6px 12px; border: 1px solid var(--mint);
  border-radius: 20px; transition: all .15s;
}
.view-link:hover { background: rgba(78,255,197,.12); }

.edit-field { display: flex; flex-direction: column; gap: 4px; }
.edit-field label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--ink-3);
  letter-spacing: .05em;
}
.field-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ai-btn {
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(78,255,197,.18), rgba(255,122,69,.14));
  border: 1px solid var(--mint);
  border-radius: 20px;
  color: var(--mint);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.ai-btn:hover:not(:disabled) { filter: brightness(1.1); }
.ai-btn:disabled { opacity: .6; cursor: not-allowed; }
.edit-field textarea {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Nunito', sans-serif;
  resize: vertical;
}
.edit-field textarea:focus { outline: none; border-color: var(--mint); }
.muted { color: var(--ink-3); font-size: .82rem; font-weight: 500; text-transform: none; letter-spacing: normal; }
.upload-msg { min-height: 1.1em; margin: 4px 0 0; }

.photo-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.photo-grid .t {
  position: relative; width: 76px; height: 76px;
  border-radius: 10px; overflow: hidden; border: 1px solid var(--border);
}
.photo-grid .t img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-grid .t button {
  position: absolute; top: 3px; right: 3px; width: 18px; height: 18px;
  border: 0; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff;
  font-size: 11px; line-height: 18px; cursor: pointer; padding: 0;
}
.cover-tag {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,.55); color: var(--mint);
  font-size: 9px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .06em; text-align: center; padding: 2px 0;
}
.add-photo {
  width: 76px; height: 76px; border-radius: 10px;
  border: 1.5px dashed var(--border);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; cursor: pointer; color: var(--ink-3);
  font-size: 10px; font-weight: 700; transition: all .15s;
  text-transform: none; letter-spacing: normal;
}
.add-photo:hover { border-color: var(--mint); color: var(--mint); }
.add-photo.busy { pointer-events: none; opacity: .7; }
.add-photo input { display: none; }
.add-icon { font-size: 18px; line-height: 1; }

.toggle-row { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.toggle-card {
  flex: 1; min-width: 200px;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  cursor: pointer; transition: all .15s;
}
.toggle-card:hover { border-color: var(--mint); }
.toggle-card.on { border-color: var(--mint); background: rgba(78,255,197,.07); }
.toggle-card input { accent-color: var(--mint); cursor: pointer; flex-shrink: 0; margin: 0; }
.toggle-emoji { font-size: 16px; flex-shrink: 0; }
.toggle-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.toggle-text strong { font-size: 12px; font-weight: 800; color: var(--ink); }
.toggle-text small { font-size: 10.5px; font-weight: 600; color: var(--ink-3); }

.form-error { color: var(--coral); font-size: 12px; margin-top: 10px; }
.pub-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
</style>
