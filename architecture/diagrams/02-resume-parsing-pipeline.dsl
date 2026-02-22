@direction TB
@spacing 50

(User Uploads PDF or DOCX) -> [Validate File Type and Size]
[Validate File Type and Size] -> {Valid?}
{Valid?} -> "yes" -> [Upload to R2 Storage]
{Valid?} -> "no" -> (Return Error Response)
[Upload to R2 Storage] -> [Enqueue Parse Job via QStash]
[Enqueue Parse Job via QStash] -> [Parser Worker Starts]
[Parser Worker Starts] -> [Extract Raw Text]
[Extract Raw Text] -> {Parse OK?}
{Parse OK?} -> "yes" -> [Detect Resume Sections]
{Parse OK?} -> "no" -> [Retry with Fallback]
[Retry with Fallback] -> {Retry OK?}
{Retry OK?} -> "yes" -> [Detect Resume Sections]
{Retry OK?} -> "no" -> [Mark as Failed in DB]
[Detect Resume Sections] -> [Build Canonical JSON]
[Build Canonical JSON] -> [Extract Keywords and Skills]
[Extract Keywords and Skills] -> [Store Parsed Data in PostgreSQL]
[Store Parsed Data in PostgreSQL] -> [Cache in Redis]
[Cache in Redis] -> (Notify User via WebSocket)
