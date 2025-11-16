# Fix Hardcoded Dashboard Links

Alle bestanden waar `href="/dashboard/owner"` staat moeten vervangen worden met:

```tsx
href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

## Bestanden die gefixed moeten worden:

1. src/app/favorites/page.tsx
2. src/app/test/page.tsx (test page, minder belangrijk)
3. src/app/dashboard/owner/calendar/page.tsx
4. src/app/pets/page.tsx
5. src/app/profile/[id]/page.tsx
6. src/app/reviews/[id]/page.tsx
7. src/app/pets/history/[id]/page.tsx
8. src/app/reviews/page.tsx
9. src/app/search/page.tsx

## Fix per bestand:

### src/app/favorites/page.tsx
Zoek regel ~70 en vervang:
```tsx
<Link href="/dashboard/owner"
```
met:
```tsx
<Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

### src/app/pets/page.tsx
Zoek regel ~57 en vervang:
```tsx
<Link href="/dashboard/owner"
```
met:
```tsx
<Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

### src/app/reviews/page.tsx
Zoek regel ~99 en vervang:
```tsx
<Link href="/dashboard/owner"
```
met:
```tsx
<Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

### src/app/search/page.tsx
Zoek regel ~140 en vervang:
```tsx
<Link href="/dashboard/owner"
```
met:
```tsx
<Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

### src/app/profile/[id]/page.tsx
Zoek regels ~79 en ~97 en vervang:
```tsx
href="/dashboard/owner"
```
met:
```tsx
href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```

### src/app/reviews/[id]/page.tsx
Zoek regels ~209 en ~235 en vervang:
```tsx
href="/dashboard/owner"
```
met:
```tsx
href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
```


















