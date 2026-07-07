# UI Components Quick Reference

## Button Component (AppButton.vue)

### Props
- `variant`: 'primary' | 'secondary' | 'brand' | 'danger' | 'ghost' (default: 'secondary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean
- `loading`: boolean

### Usage
```vue
<!-- Primary button -->
<AppButton variant="primary" @click="handleClick">
  Click Me
</AppButton>

<!-- Loading state -->
<AppButton variant="primary" :loading="isLoading">
  Save
</AppButton>

<!-- Large primary button -->
<AppButton variant="primary" size="lg">
  Start
</AppButton>

<!-- Danger button -->
<AppButton variant="danger">Delete</AppButton>

<!-- Ghost variant -->
<AppButton variant="ghost">Learn More</AppButton>
```

### Styling
- **Primary**: Mint/Teal gradient with glow
- **Secondary**: Surface background with border (default)
- **Brand**: Orange gradient
- **Danger**: Coral outline (destructive action)
- **Ghost**: Transparent, minimal styling
- **Hover**: All lift -2px, enhanced shadow
- **Disabled**: Opacity 0.5, no interaction

---

## Input Component (AppInput.vue)

### Props
- `modelValue`: string | number
- `label`: string
- `placeholder`: string
- `type`: string (default: 'text')
- `hint`: string
- `error`: string (shows error styling)
- `optional`: boolean
- `prefixIcon`: boolean
- `suffixIcon`: boolean
- `clearable`: boolean

### Usage
```vue
<!-- Basic input -->
<AppInput
  v-model="email"
  label="Email Address"
  placeholder="user@example.com"
/>

<!-- With error state -->
<AppInput
  v-model="email"
  label="Email"
  error="Please enter a valid email"
/>

<!-- With clear button -->
<AppInput
  v-model="search"
  label="Search"
  clearable
/>

<!-- With icons -->
<AppInput
  v-model="username"
  label="Username"
  :prefixIcon="true"
  :suffixIcon="true"
>
  <template #prefix-icon>
    <icon-user />
  </template>
  <template #suffix-icon>
    <icon-check v-if="isValid" />
  </template>
</AppInput>

<!-- Textarea -->
<AppInput
  v-model="message"
  label="Message"
  type="textarea"
/>
```

### Features
- Minimum height: 44px (touch-friendly)
- Focus glow: Teal color with soft shadow
- Error state: Coral border with message
- Clear button: Auto-clears input
- Smooth transitions: All 0.2s cubic-bezier

---

## Card Component (AppCard.vue)

### Props
- `title`: string
- `variant`: 'default' | 'elevated' | 'outlined' | 'gradient' (default: 'default')
- `noPad`: boolean (removes padding)
- `flat`: boolean (no hover lift)
- `interactive`: boolean (clickable styling)

### Slots
- `default`: Main content
- `header`: Custom header (replaces title)
- `footer`: Footer section

### Usage
```vue
<!-- Basic card -->
<AppCard title="Profile">
  <p>User information goes here</p>
</AppCard>

<!-- Elevated card (featured) -->
<AppCard title="Featured Content" variant="elevated">
  <p>This card stands out more</p>
</AppCard>

<!-- Card with header and footer -->
<AppCard>
  <template #header>
    <h2>Settings</h2>
  </template>

  <p>Settings content</p>

  <template #footer>
    <AppButton variant="primary">Save</AppButton>
    <AppButton variant="secondary">Cancel</AppButton>
  </template>
</AppCard>

<!-- Outlined card -->
<AppCard variant="outlined">
  <p>Clean, minimal card</p>
</AppCard>

<!-- Gradient card -->
<AppCard variant="gradient" title="Special Section">
  <p>Card with subtle gradient</p>
</AppCard>

<!-- Interactive card (clickable) -->
<AppCard interactive @click="navigateTo('details')">
  <p>Click to see more</p>
</AppCard>
```

### Variants
- **default**: Standard styling, good for general content
- **elevated**: Stronger shadow, best for featured content
- **outlined**: Minimal shadow, clean borders
- **gradient**: Subtle gradient, special sections

---

## Badge Component (AppBadge.vue)

### Props
- `type`: Role types ('vol', 'adm', 'staff') | Priority ('high', 'med', 'low') | Status ('success', 'info') | Animal statuses
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

### Usage
```vue
<!-- Volunteer badge -->
<AppBadge type="vol">Volunteer</AppBadge>

<!-- Admin badge -->
<AppBadge type="adm">Admin</AppBadge>

<!-- Priority badges -->
<AppBadge type="high">High Priority</AppBadge>
<AppBadge type="med">Medium</AppBadge>
<AppBadge type="low">Low</AppBadge>

<!-- Animal status badges -->
<AppBadge type="available">Available</AppBadge>
<AppBadge type="adopted">Adopted</AppBadge>
<AppBadge type="medical">Medical Hold</AppBadge>

<!-- Size variants -->
<AppBadge type="vol" size="sm">Small</AppBadge>
<AppBadge type="vol" size="md">Medium</AppBadge>
<AppBadge type="vol" size="lg">Large</AppBadge>
```

### Badge Types
- **Role**: vol (volunteer), adm (admin), staff
- **Priority**: high, med, low
- **Status**: success, info
- **Animal**: intake, quarantine, available, foster, adopted, sanctuary, medical, transferred, deceased

---

## Select Component (AppSelect.vue)

### Props
- `modelValue`: string | number
- `label`: string
- `placeholder`: string
- `options`: Array<{label, value}> | Array<string>
- `hint`: string
- `error`: string
- `optional`: boolean

### Usage
```vue
<!-- Basic select -->
<AppSelect
  v-model="role"
  label="Role"
  :options="['Admin', 'Volunteer', 'Staff']"
/>

<!-- With objects -->
<AppSelect
  v-model="selectedRole"
  label="Role"
  :options="[
    { label: 'Administrator', value: 'admin' },
    { label: 'Volunteer', value: 'volunteer' },
    { label: 'Staff', value: 'staff' }
  ]"
/>

<!-- With error -->
<AppSelect
  v-model="country"
  label="Country"
  error="This field is required"
  :options="countryList"
/>

<!-- Optional field -->
<AppSelect
  v-model="notes"
  label="Notes"
  optional
  :options="noteTypes"
/>
```

### Features
- Minimum height: 44px
- Custom arrow icon
- Focus glow effect
- Error state support
- Smooth transitions

---

## Alert Box Component (AlertBox.vue)

### Props
- `type`: 'danger' | 'warn' | 'info' | 'success' (default: 'info')

### Slots
- `icon`: Custom icon (optional)
- `default`: Alert message

### Usage
```vue
<!-- Danger alert -->
<AlertBox type="danger">
  Error: Unable to save changes
</AlertBox>

<!-- Warning alert -->
<AlertBox type="warn">
  This action cannot be undone
</AlertBox>

<!-- Success alert -->
<AlertBox type="success">
  Changes saved successfully!
</AlertBox>

<!-- Info alert -->
<AlertBox type="info">
  New features available
</AlertBox>

<!-- With custom icon -->
<AlertBox type="warn">
  <template #icon>
    <icon-alert />
  </template>
  Warning message
</AlertBox>
```

### Alert Types
- **danger**: Red/coral for errors
- **warn**: Amber/orange for warnings
- **success**: Mint/green for success
- **info**: Blue for information

---

## Stat Card Component (StatCard.vue)

### Props
- `value`: string | number
- `label`: string
- `tab`: string (optional, for navigation)

### Usage
```vue
<!-- Basic stat card -->
<StatCard value="42" label="Total Animals" />

<!-- Clickable stat card (navigates to tab) -->
<StatCard value="12" label="Available" tab="available" />

<!-- In a grid -->
<div class="grid grid-cols-3 gap-4">
  <StatCard value="42" label="Animals" />
  <StatCard value="28" label="Volunteers" />
  <StatCard value="15" label="Shifts" />
</div>
```

### Features
- Large, prominent value display (44px)
- Gradient background
- Clickable variant for navigation
- Smooth hover effects
- Text shadow for depth

---

## Section Label Component (SectionLabel.vue)

### Usage
```vue
<!-- Section divider -->
<SectionLabel>Activity Recent</SectionLabel>

<!-- In a layout -->
<div class="page">
  <h1>Dashboard</h1>

  <SectionLabel>Statistics</SectionLabel>
  <!-- stat cards here -->

  <SectionLabel>Recent Activity</SectionLabel>
  <!-- activity list here -->
</div>
```

### Features
- Vertical gradient accent line
- Bottom divider
- Uppercase styling
- Smooth design

---

## Empty State Component (EmptyState.vue)

### Props
- `icon`: string (emoji or symbol, default: '🔍')
- `title`: string (required)
- `message`: string (optional)

### Slots
- `default`: Action buttons or content

### Usage
```vue
<!-- Basic empty state -->
<EmptyState
  icon="🔍"
  title="No Results"
  message="Try adjusting your search criteria"
/>

<!-- With action button -->
<EmptyState
  icon="📝"
  title="No Items"
  message="Create your first item to get started"
>
  <AppButton variant="primary">Create Item</AppButton>
</EmptyState>

<!-- Custom icon -->
<EmptyState
  icon="🚀"
  title="Ready to Launch"
  message="Everything is set up!"
/>
```

### Features
- Floating icon animation
- Icon container with gradient background
- Smooth transitions
- Respects prefers-reduced-motion

---

## User Row Component (UserRow.vue)

### Props
- `name`: string (required)
- `sub`: string (optional subtitle)
- `badge`: string (optional badge text)
- `badgeType`: string (default: 'vol')

### Slots
- `badge`: Custom badge (replaces default)
- `actions`: Action buttons

### Usage
```vue
<!-- Basic user row -->
<UserRow name="John Doe" />

<!-- With subtitle -->
<UserRow
  name="Jane Smith"
  sub="Senior Volunteer"
  badge="Volunteer"
  badgeType="vol"
/>

<!-- With custom actions -->
<UserRow
  name="John Doe"
  sub="Volunteer"
  badge="Active"
  badgeType="vol"
>
  <template #actions>
    <button @click="edit">Edit</button>
    <button @click="delete">Delete</button>
  </template>
</UserRow>

<!-- In a list -->
<div>
  <UserRow
    v-for="user in volunteers"
    :key="user.id"
    :name="user.name"
    :sub="user.role"
    badge="volunteer"
  />
</div>
```

### Features
- Avatar with gradient background
- Hover effects
- Badge support
- Action slots
- Better spacing

---

## Global Animation Classes

### Transition Classes
```vue
<!-- Slide up (default page transition) -->
<Transition name="slide-up">
  <div v-if="show">Content</div>
</Transition>

<!-- Slide down -->
<Transition name="slide-down">
  <div v-if="show">Content</div>
</Transition>

<!-- Scale (modal/dialog) -->
<Transition name="scale">
  <div v-if="show">Content</div>
</Transition>

<!-- Fade -->
<Transition name="fade">
  <div v-if="show">Content</div>
</Transition>
```

### Utility Classes
```vue
<!-- Loading spinner -->
<div class="spinning">📌</div>

<!-- Glowing effect -->
<div class="glowing">Important</div>

<!-- Pulsing effect -->
<div class="pulsing">Loading...</div>
```

---

## Design System Reference

### Colors
- **Primary**: Mint (#4EFFC5) - CTAs, highlights
- **Brand**: Orange (#FF7A45) - Brand elements
- **Danger**: Coral (#FF6B6B) - Errors, destructive
- **Warning**: Amber (#D97706) - Warnings
- **Info**: Blue (#74B0FF) - Information
- **Success**: Mint (#4EFFC5) - Success states

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px

### Border Radius
- **sm**: 8px
- **md**: 12px
- **lg**: 14px
- **xl**: 20px
- **full**: 50% (circles)

### Shadows
- **sm**: Small, subtle
- **md**: Standard depth
- **lg**: Elevated appearance
- **xl**: Heavy emphasis

### Animation Timings
- **Fast**: 0.15s - Button hovers
- **Normal**: 0.2-0.3s - Page transitions
- **Slow**: 2s - Loading effects

---

## Accessibility Features

- All components have proper ARIA attributes
- Focus states are clearly visible
- Color contrast meets WCAG AA standards
- Keyboard navigation supported
- `prefers-reduced-motion` respected
- Error messages clearly associated with inputs
- Icons have proper alt text or labels

---

## Responsive Design

All components are mobile-first and responsive:
- Buttons: Touch-friendly (44px minimum)
- Inputs: Large enough for mobile typing
- Cards: Full width on mobile, constrained on desktop
- Text: Scales appropriately
- Spacing: Adjusts for smaller screens

---

## Performance Tips

1. Use `v-show` for frequently toggled elements
2. Lazy-load cards when in long lists
3. Debounce input events for search
4. Use computed properties for complex filtering
5. Minimize re-renders with proper key binding

---

## Common Patterns

### Form Validation
```vue
<AppInput
  v-model="email"
  label="Email"
  :error="emailError"
  hint="We'll never share your email"
/>
```

### Loading States
```vue
<AppButton
  :loading="isSubmitting"
  variant="primary"
>
  Save Changes
</AppButton>
```

### Success/Error Handling
```vue
<AlertBox v-if="error" type="danger">
  {{ error }}
</AlertBox>

<AlertBox v-if="success" type="success">
  Changes saved successfully!
</AlertBox>
```

### Empty States
```vue
<EmptyState
  v-if="items.length === 0"
  icon="📋"
  title="No Items"
  message="Start by creating your first item"
>
  <AppButton variant="primary" @click="create">
    Create Item
  </AppButton>
</EmptyState>
```

---

## Troubleshooting

### Button not responding to clicks
- Check if `disabled` or `loading` props are set to true
- Ensure click handler is properly attached

### Input not showing error
- Make sure `error` prop contains a string
- Error message appears below the input

### Card header not showing
- Provide `title` prop or use `#header` slot
- Without either, header section won't render

### Badge size not changing
- Use `size` prop: 'sm', 'md', or 'lg'
- Default is 'md'

### Animations not running
- Check if `prefers-reduced-motion` is enabled
- Verify no conflicting CSS is overriding animations

---

## Best Practices

1. **Always provide labels** for form inputs
2. **Use proper button variants** for context
3. **Show loading states** for async operations
4. **Display error messages** clearly
5. **Use semantic HTML** and ARIA attributes
6. **Test on mobile devices** regularly
7. **Keep card content concise**
8. **Use proper color contrast**
9. **Provide visual feedback** for interactions
10. **Respect user preferences** (animations, theme)

---

## Need Help?

- Check component props for available options
- Review usage examples in this guide
- Look at existing implementations in the codebase
- Test in browser dev tools
- Check console for warnings/errors

---

**Last Updated**: June 28, 2026
**System**: Sanctuary Base v2
**Version**: Modern UI Redesign v1.0
