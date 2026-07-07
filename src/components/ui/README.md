# UI Component Library

All reusable building blocks live here. When building a feature page, **use these instead of writing inline styles**.

Import everything from the barrel file:
```js
import { AppCard, StatCard, SectionLabel, AlertBox, AppButton, UserRow, EmptyState, AppInput, PageContainer } from '../ui'
```

---

## PageContainer
Wraps every feature page. Handles padding and max-width.
```vue
<PageContainer>
  <!-- page content -->
</PageContainer>
```

---

## AppCard
Standard card with gradient top border and hover lift.
```vue
<AppCard>Content</AppCard>
<AppCard title="Section Title">Content</AppCard>
<AppCard :flat="true">No hover lift</AppCard>
<AppCard :no-pad="true">Content touches edges</AppCard>
```

---

## StatCard
Big number stat. Pass `tab` to make it clickable.
```vue
<StatCard value="42"    label="Animals"    tab="animals" />
<StatCard value="$3450" label="This Month"              />
```

---

## SectionLabel
Teal uppercase section header with left border.
```vue
<SectionLabel>On shift right now</SectionLabel>
```

---

## AlertBox
Colored alert strip. Types: `danger` | `warn` | `info` | `success`
```vue
<AlertBox type="danger">🚨 2 bite reports need review</AlertBox>
<AlertBox type="warn">⚠️ 3 waivers missing</AlertBox>
<AlertBox type="success">✓ All animals fed</AlertBox>
```

---

## AppButton
Button with variants and sizes.

**Variants:** `secondary` (default) | `primary` (mint) | `brand` (orange) | `danger` (coral)
**Sizes:** `md` (default) | `sm`

```vue
<AppButton @click="doSomething">Default button</AppButton>
<AppButton variant="primary" @click="save">Save</AppButton>
<AppButton variant="brand">Sign in with Google</AppButton>
<AppButton variant="danger" size="sm">Delete</AppButton>
<AppButton :disabled="loading">Saving...</AppButton>
```

---

## UserRow
Volunteer/person row with avatar, name, subtitle, and optional badge.
```vue
<UserRow
  name="Sarah Johnson"
  sub="Morning Care · 2h 14m"
  badge="Active"
  badge-type="vol"
/>
```
**Badge types:** `vol` | `adm` | `high` | `med` | `low` | `info`

Use inside an `AppCard` with dividers:
```vue
<AppCard>
  <div class="divide-list">
    <UserRow v-for="v in volunteers" :key="v.id" :name="v.name" :sub="v.email" />
  </div>
</AppCard>
```

---

## AppBadge
Inline colored pill label.
```vue
<AppBadge type="vol">Volunteer</AppBadge>
<AppBadge type="high">High priority</AppBadge>
```
**Types:** `vol` | `adm` | `high` | `med` | `low` | `success` | `info`

---

## EmptyState
Centered empty state when a list has nothing to show.
```vue
<EmptyState icon="😴" title="No one on shift" message="Check back later." />
<EmptyState icon="🐾" title="No animals found">
  <AppButton variant="primary">Add Animal</AppButton>
</EmptyState>
```

---

## AppInput
Styled text input or textarea with label and hint.
```vue
<AppInput v-model="name" label="Animal name" placeholder="e.g. Luna" />
<AppInput v-model="notes" type="textarea" label="Notes" :optional="true" hint="Visible to all staff" />
<AppInput v-model="email" type="email" label="Email" />
```

---

## Rules for Feature Pages

1. **Always wrap in `<PageContainer>`**
2. **Use `<AppCard>` for any grouped content** — never write card styles inline
3. **Use `<SectionLabel>` for section titles** — never style a div to look like one
4. **Use `<AppButton>` for all buttons** — never write `<button class="...">`
5. **Use `<AlertBox>` for warnings/errors** — never write colored boxes inline
6. **Use `<EmptyState>` when lists are empty**
7. **Scoped `<style>` blocks are OK** for layout specific to that page (grid columns, spacing between sections)
8. **No hardcoded hex colors** — always use CSS variables (`var(--mint)`, `var(--coral)`, etc.)
