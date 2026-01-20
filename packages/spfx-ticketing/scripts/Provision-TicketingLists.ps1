param(
  [Parameter(Mandatory = $true)]
  [string]$SiteUrl,
  [string]$TicketsListTitle = "Tickets",
  [string]$TimelineListTitle = "TicketTimeline",
  [string]$TemplatesListTitle = "ReplyTemplates",
  [string]$LogsListTitle = "AppLogs"
)

Connect-PnPOnline -Url $SiteUrl -Interactive

# Tickets list
New-PnPList -Title $TicketsListTitle -Template GenericList -ErrorAction SilentlyContinue
Add-PnPField -List $TicketsListTitle -DisplayName "TicketId" -InternalName "TicketId" -Type Text -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "Status" -InternalName "Status" -Type Choice -Choices "Neu","In Bearbeitung","Wartet auf Kunde","Wartet auf Außendienst","Erledigt" -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "Priority" -InternalName "Priority" -Type Choice -Choices "Niedrig","Normal","Hoch" -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "AssignedTo" -InternalName "AssignedTo" -Type User -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "RequesterName" -InternalName "RequesterName" -Type Text
Add-PnPField -List $TicketsListTitle -DisplayName "RequesterEmail" -InternalName "RequesterEmail" -Type Text
Add-PnPField -List $TicketsListTitle -DisplayName "Channel" -InternalName "Channel" -Type Choice -Choices "Email","PDF" -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "Category" -InternalName "Category" -Type Choice -Choices "Allgemein","Rechnung","Versand" -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "DueDate" -InternalName "DueDate" -Type DateTime -AddToDefaultView
Add-PnPField -List $TicketsListTitle -DisplayName "LastActionAt" -InternalName "LastActionAt" -Type DateTime
Add-PnPField -List $TicketsListTitle -DisplayName "SourceMessageId" -InternalName "SourceMessageId" -Type Text
Add-PnPField -List $TicketsListTitle -DisplayName "ThreadKey" -InternalName "ThreadKey" -Type Text
Add-PnPField -List $TicketsListTitle -DisplayName "FieldSalesEmail" -InternalName "FieldSalesEmail" -Type Text
Add-PnPField -List $TicketsListTitle -DisplayName "ApprovalState" -InternalName "ApprovalState" -Type Choice -Choices "Offen","Genehmigt","Abgelehnt"

# Timeline list
New-PnPList -Title $TimelineListTitle -Template GenericList -ErrorAction SilentlyContinue
Add-PnPField -List $TimelineListTitle -DisplayName "TicketLookup" -InternalName "TicketLookup" -Type Lookup -LookupList $TicketsListTitle -LookupField "Title" -AddToDefaultView
Add-PnPField -List $TimelineListTitle -DisplayName "EntryType" -InternalName "EntryType" -Type Choice -Choices "IncomingEmail","OutgoingEmail","InternalNote","StatusChange" -AddToDefaultView
Add-PnPField -List $TimelineListTitle -DisplayName "Body" -InternalName "Body" -Type Note
Add-PnPField -List $TimelineListTitle -DisplayName "From" -InternalName "From" -Type Text
Add-PnPField -List $TimelineListTitle -DisplayName "To" -InternalName "To" -Type Text
Add-PnPField -List $TimelineListTitle -DisplayName "Cc" -InternalName "Cc" -Type Text
Add-PnPField -List $TimelineListTitle -DisplayName "MessageId" -InternalName "MessageId" -Type Text
Add-PnPField -List $TimelineListTitle -DisplayName "SentAt" -InternalName "SentAt" -Type DateTime
Add-PnPField -List $TimelineListTitle -DisplayName "IdempotencyKey" -InternalName "IdempotencyKey" -Type Text

# ReplyTemplates list
New-PnPList -Title $TemplatesListTitle -Template GenericList -ErrorAction SilentlyContinue
Add-PnPField -List $TemplatesListTitle -DisplayName "TemplateName" -InternalName "TemplateName" -Type Text -AddToDefaultView
Add-PnPField -List $TemplatesListTitle -DisplayName "Category" -InternalName "Category" -Type Choice -Choices "Allgemein","Rechnung","Versand" -AddToDefaultView
Add-PnPField -List $TemplatesListTitle -DisplayName "Audience" -InternalName "Audience" -Type Choice -Choices "Customer","FieldSales","Internal" -AddToDefaultView
Add-PnPField -List $TemplatesListTitle -DisplayName "SubjectTemplate" -InternalName "SubjectTemplate" -Type Text
Add-PnPField -List $TemplatesListTitle -DisplayName "BodyTemplate" -InternalName "BodyTemplate" -Type Note
Add-PnPField -List $TemplatesListTitle -DisplayName "Active" -InternalName "Active" -Type Boolean -AddToDefaultView

# AppLogs list
New-PnPList -Title $LogsListTitle -Template GenericList -ErrorAction SilentlyContinue
Add-PnPField -List $LogsListTitle -DisplayName "Level" -InternalName "Level" -Type Choice -Choices "Info","Error" -AddToDefaultView
Add-PnPField -List $LogsListTitle -DisplayName "Data" -InternalName "Data" -Type Note
