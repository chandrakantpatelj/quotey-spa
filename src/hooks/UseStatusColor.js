import { useTheme } from '@mui/material/styles'
import {
  STATUS_AWAITING_RECONCILIATION,
  STATUS_CLEAR_TO_RECEIVE,
  STATUS_CLEARED,
  STATUS_CONFIRMED,
  STATUS_CUSTOM_CLEARED,
  STATUS_DELIVERED,
  STATUS_PAID,
  STATUS_PARTLY_CLEARED,
  STATUS_PARTLY_PAID,
  STATUS_PARTLY_RECEIVED,
  STATUS_PENDING,
  STATUS_RECEIVED,
  STATUS_SENT,
  STATUS_SHIPPED,
  STATUS_NEW,
  STATUS_PACKED,
  STATUS_FULFILLED,
  STATUS_PARTLY_FULFILLED,
  STATUS_INVOICED,
  STATUS_ISSUED,
  STATUS_PENDING_CLEARANCE,
  STATUS_COMPLETE,
  STATUS_PARTLY_SHIPPED,
  STATUS_PARTLY_DELIVERED
} from 'src/common-functions/utils/Constants'

export default function UseStatusColor(status) {
  const theme = useTheme()

  const getColor = status => {
    switch (status) {
      case STATUS_SENT:
        return theme.palette.info.main
      case STATUS_CONFIRMED:
        return theme.palette.success.main
      case STATUS_SHIPPED:
        return theme.palette.primary.main
      case STATUS_PARTLY_SHIPPED:
        return theme.palette.success.main
      case STATUS_RECEIVED:
        return theme.palette.success.main
      case STATUS_PARTLY_RECEIVED:
        return theme.palette.warning.main
      case STATUS_PARTLY_PAID:
        return theme.palette.success.main
      case STATUS_PAID:
        return theme.palette.info.main
      case STATUS_PARTLY_DELIVERED:
        return theme.palette.primary.main
      case STATUS_DELIVERED:
        return theme.palette.primary.main
      case STATUS_PENDING:
        return theme.palette.error.main
      case STATUS_PARTLY_CLEARED:
        return theme.palette.warning.main
      case STATUS_CLEARED:
        return theme.palette.success.main
      case STATUS_CUSTOM_CLEARED:
        return theme.palette.warning.main
      case STATUS_CLEAR_TO_RECEIVE:
        return theme.palette.success.main
      case STATUS_AWAITING_RECONCILIATION:
        return theme.palette.warning.main
      case STATUS_NEW:
        return theme.palette.primary.main
      case STATUS_PENDING_CLEARANCE:
        return theme.palette.error.main
      case STATUS_PARTLY_FULFILLED:
        return theme.palette.warning.main
      case STATUS_FULFILLED:
        return theme.palette.warning.main
      case STATUS_PACKED:
        return theme.palette.success.main
      case STATUS_INVOICED:
        return theme.palette.info.main
      case STATUS_ISSUED:
        return theme.palette.success.main
      case STATUS_COMPLETE:
        return theme.palette.primary.main
      case 'CLOSED':
        return theme.palette.error.main
      case 'estimator ':
        return theme.palette.warning.main
      case 'admin':
        return theme.palette.primary.main
      case 'user':
        return theme.palette.success.main
      case 'test-role':
        return theme.palette.info.main
      case 'writer':
        return theme.palette.success.main
      case 'deleter':
        return theme.palette.error.main
      default:
        return theme.palette.secondary.main
    }
  }

  return getColor(status)
}
