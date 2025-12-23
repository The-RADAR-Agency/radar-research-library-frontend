import type { SourceDocument, Entity } from '@/lib/types'

export function canUserSeeReport(report: SourceDocument, currentUserId: string): boolean {
  switch (report.visibility) {
    case 'just_me':
      return report.uploaded_by === currentUserId

    case 'select_users':
      return report.uploaded_by === currentUserId || 
             (report.visible_to?.includes(currentUserId) ?? false)

    case 'radar_members':
      return true

    case 'public':
      return true

    default:
      return false
  }
}

export function canUserSeeEntity(
  entity: Entity, 
  currentUserId: string, 
  allReports: SourceDocument[]
): boolean {
  const parentReport = allReports.find(r => r.id === entity.extracted_from)
  if (!parentReport) return false
  
  return canUserSeeReport(parentReport, currentUserId)
}

export function filterByVisibility<T extends Entity>(
  entities: T[],
  currentUserId: string,
  allReports: SourceDocument[],
  visibilityFilter: 'All' | 'My Content' | 'Shared with Me'
): T[] {
  return entities.filter(entity => {
    const parentReport = allReports.find(r => r.id === entity.extracted_from)
    if (!parentReport) return false

    if (!canUserSeeEntity(entity, currentUserId, allReports)) {
      return false
    }

    switch (visibilityFilter) {
      case 'My Content':
        return parentReport.uploaded_by === currentUserId

      case 'Shared with Me':
        return parentReport.uploaded_by !== currentUserId &&
               (parentReport.visible_to?.includes(currentUserId) ?? false)

      case 'All':
        return true

      default:
        return false
    }
  })
}

export function filterReportsByVisibility(
  reports: SourceDocument[],
  currentUserId: string,
  visibilityFilter: 'All' | 'My Content' | 'Shared with Me'
): SourceDocument[] {
  return reports.filter(report => {
    if (!canUserSeeReport(report, currentUserId)) {
      return false
    }

    switch (visibilityFilter) {
      case 'My Content':
        return report.uploaded_by === currentUserId

      case 'Shared with Me':
        return report.uploaded_by !== currentUserId &&
               (report.visible_to?.includes(currentUserId) ?? false)

      case 'All':
        return true

      default:
        return false
    }
  })
}
