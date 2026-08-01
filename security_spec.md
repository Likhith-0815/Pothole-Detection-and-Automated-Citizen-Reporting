# Firebase Security Specification - GVMC CivicEye Portal

## 1. Data Invariants
- An incident must contain valid title, ward, severity, status, and reportedAt.
- Public read access is permitted for civic transparency in GVMC roads monitoring.
- Creation and updates are allowed for authenticated/authorized municipal officers and citizens.

## 2. Dirty Dozen Payload Security Test Cases
1. Missing required fields in incident creation -> Rejected
2. Invalid severity type -> Rejected
3. Unauthorized mutation of incident fields by non-authenticated entity -> Rejected
4. Invalid string lengths exceeding schema limits -> Rejected

## 3. Collections & Access Control
- `/incidents/{incidentId}`: Read allowed for all users (public civic dashboard). Create/update allowed for authenticated users.
- `/crews/{crewId}`: Read allowed for all users. Create/update allowed for authenticated users.
- `/test/{testId}`: Read allowed for connection testing.
