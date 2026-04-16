# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.90] - 2026-04-16

### Added
- **UTM Attribution**: Track user acquisition source from external links. When users open the Mini App via link with `?start=<base64>` parameter, UTM data (source, medium, campaign, referrer) is extracted and sent to PostHog for analytics.

### Fixed
- Fixed vulnerability in follow-redirects dependency (moderate severity)

### Changed
- Improved experiment assignment timing - identify called before experiment_assigned event for accurate person-level breakdowns in PostHog
- Fixed duplicate experiment assignment events

## [1.2.89] - 2026-04-15

### Added
- **Fast Mental Help**: New "Rapid Techniques" flow for quick mental health exercises (4-6 breathing, grounding)

### Fixed
- Various bug fixes and improvements

## [1.2.88] - 2026-04-14

### Added
- **Sync Architecture Audit**: Multiple improvements to data synchronization
  - Fetch cache cleared before initial/force sync
  - Mutex serializes concurrent syncs
  - Cross-tab sync with BroadcastChannel
  - Incremental sync error surfaced in UI

### Fixed
- Fixed redundant refreshes after sync hydration
- Analytics synced_types populated with actual types