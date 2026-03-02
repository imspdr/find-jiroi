# @imspdr/ui Component Guide for Agents & LLMs

This document provides a comprehensive specification of the `@imspdr/ui` library. It is designed to be parsed by AI agents to ensure consistent implementation of the design system without needing to inspect the underlying source code.

---

## 1. Core Principles & Constraints

### 🔴 Mandatory Rules (MUST)
- **Standardized Typography**: Wrap ALL text in the `<Typography />` component. Do NOT use primitive tags like `<span>`, `<p>`, `<h1>`-`<h6>` directly.
- **Strict Color Tokens**: Use system color tokens (e.g., `primary.1`) for all `color` and `background` properties. Never hardcode Hex, RGB, or HSL values.
- **Korean Localization**: All user-facing labels, placeholders, and messages must be in **Korean** by default.
- **Responsive Handling**: Layouts must be responsive, respecting the `768px` breakpoint.

### 🟡 Best Practices (SHOULD)
- **Import Pattern**: Prefer importing from the root index: `import { Button, Typography } from '@imspdr/ui';`.
- **Loading States**: Always utilize the `isLoading` prop on buttons for asynchronous operations.
- **Logical Structure**: Use `Layout` and `Header` components to maintain consistency across different micro-frontends.

---

## 2. Design System: Color Tokens

Colors are accessed via string tokens. The system supports two formats: `'category.level'` (e.g., `background.1`) or `'categoryLevel'` (e.g., `background1`).

### 2.1 Main Palettes
Each category has 3 levels: `1` (Lightest/Default), `2` (Medium), and `3` (Darkest/Strongest).

| Category | Usage | Token Example | Color Value (Light/Dark) |
| :--- | :--- | :--- | :--- |
| **background** | App/Container backgrounds | `background.1` | White / Slate 950 |
| **foreground** | Primary/Secondary text | `foreground.1` | Slate 900 / Slate 50 |
| **primary** | Brand identity (Teal) | `primary.1` | Teal 500 / Teal 400 |
| **danger** | Errors / Destructive actions | `danger.1` | Red 500 / Red 400 |
| **warning** | Warnings / Cautions | `warning.1` | Amber 500 / Amber 400 |
| **success** | Confirmations / Success | `success.1` | Emerald 500 / Emerald 400 |
| **info** | General information | `info.1` | Blue 500 / Blue 400 |

### 2.2 Special Tokens
- `white`: Pure white (`#ffffff`)
- `overlay`: Semi-transparent black for backdrops.
- `shadow`: Soft shadow color.

---

## 3. Component Specification

### 3.1 Typography
The foundation for all text elements.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'title' \| 'body' \| 'caption'` | `'body'` | Visual style variant. |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | Size level (1 is largest). |
| `color` | `string` | `'foreground.1'` | System color token. |
| `bold` | `boolean` | `false` | Apply bold font weight. |
| `as` | `ElementType` | Auto | Force specific HTML tag (e.g., `'h1'`, `'div'`). |

**Example**:
```tsx
<Typography variant="title" level={2} color="primary.1" bold>
  안녕하세요
</Typography>
```

### 3.2 Button
Interactive element with built-in states.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'contained' \| 'outlined' \| 'ghost' \| 'text'` | `'contained'` | Visual style. |
| `shape` | `'rounded' \| 'square' \| 'pill'` | `'rounded'` | Corner radius. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size. |
| `color` | `string` | `'primary.1'` | System color token. |
| `isLoading`| `boolean` | `false` | Shows spinner and disables clicks. |
| `fullWidth`| `boolean` | `false` | Takes up 100% of container width. |
| `leftIcon` | `ReactNode` | `null` | Icon displayed before text. |
| `rightIcon`| `ReactNode` | `null` | Icon displayed after text. |

**Example**:
```tsx
<Button variant="outlined" color="danger.1" leftIcon={<TrashIcon />}>
  삭제하기
</Button>
```

### 3.3 AutoComplete
Searchable dropdown with Korean initial consonant support.

| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array<{ label, value, subLabel? }>` | List of selectable items. |
| `onSelect` | `(option) => void` | Selection callback. |
| `noResultText`| `string` | Text shown when no matches found. |

---

## 4. Hooks & Global State

### 4.1 Modal System (`useModal`)
Managed via `ModalProvider`.

```tsx
const { openModal, closeModal } = useModal();

openModal(
  <Typography>정말 제출하시겠습니까?</Typography>,
  {
    title: '확인',
    footer: <Button onClick={handleSubmit}>제출</Button>
  }
);
```

### 4.2 Toast System (`useToast`)
Managed via `ToastProvider`.

```tsx
const { showToast } = useToast();
showToast("저장되었습니다.");
```

### 4.3 Device Type (`useDeviceType`)
Breakpoints: Mobile (up to 767px), Desktop (768px and above).

```tsx
const { isMobile, isDesktop } = useDeviceType();
```

---

## 5. Implementation Checklist for Agents

- [ ] Is all text wrapped in `<Typography />`?
- [ ] Are all colors using system tokens?
- [ ] Is the interface in Korean?
- [ ] Is the layout responsive for mobile users?
- [ ] (If applicable) Are async actions showing `isLoading` states on buttons?

