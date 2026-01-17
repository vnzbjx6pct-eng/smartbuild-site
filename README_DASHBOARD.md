# Executive Partner Dashboard

**URL:** `/partner-dashboard`
**Access:** Public / Unauthenticated (Demo Mode)

## Purpose
This page serves as a high-level "transparency monitor" for retail directors (e.g., CEO of Espak, Bauhof, etc.). It allows them to verify that the SmartBuild system is actively routing leads to their regional stores without needing to log in to complex CRM tools.

## Features
1.  **Read-Only**: No actions can be taken. Safe to share link.
2.  **Executive View**: High-level stats (Total, Growth, City Health).
3.  **Traffic Light Status**: Green/Yellow/Red indicators for quick health checks of the network.

## Data Source
Currently uses `MOCK_DATA` inside `page.tsx`.
To connect to real production data, replace the `STATS` array with a `fetch` call to `/api/analytics/partner`.
